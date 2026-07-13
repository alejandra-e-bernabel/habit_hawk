"""CRUD operations for friendships and social features."""

from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import or_, and_
from sqlalchemy.orm import Session

from database.models import Friendship, FriendshipStatus, User
from social.schemas import FriendRequestCreate, FriendListItem


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Fetch a user by username."""
    return db.query(User).filter(User.username == username).first()


def get_friendship(
    db: Session, user_id_1: int, user_id_2: int
) -> Optional[Friendship]:
    """
    Find a friendship between two users, regardless of direction.

    Args:
        db: Database session
        user_id_1: First user ID
        user_id_2: Second user ID

    Returns:
        Friendship if found, None otherwise
    """
    return db.query(Friendship).filter(
        or_(
            and_(
                Friendship.requester_id == user_id_1,
                Friendship.addressee_id == user_id_2
            ),
            and_(
                Friendship.requester_id == user_id_2,
                Friendship.addressee_id == user_id_1
            )
        )
    ).first()


def send_friend_request(
    db: Session, request_data: FriendRequestCreate, current_user: User
) -> Friendship:
    """
    Send a friend request to another user.

    Args:
        db: Database session
        request_data: Friend request data with username
        current_user: User sending the request

    Returns:
        Created Friendship object

    Raises:
        HTTPException: If user not found, trying to friend self, or friendship exists
    """
    # Find the target user
    target_user = get_user_by_username(db, request_data.username)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User '{request_data.username}' not found"
        )

    # Prevent self-friending
    if target_user.user_id == current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot send a friend request to yourself"
        )

    # Check if friendship already exists (in either direction)
    existing = get_friendship(db, current_user.user_id, target_user.user_id)
    if existing:
        if existing.status == FriendshipStatus.pending:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A friend request is already pending with this user"
            )
        elif existing.status == FriendshipStatus.accepted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You are already friends with this user"
            )
        elif existing.status == FriendshipStatus.blocked:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot send friend request to this user"
            )

    # Create the friend request
    friendship = Friendship(
        requester_id=current_user.user_id,
        addressee_id=target_user.user_id,
        status=FriendshipStatus.pending
    )

    db.add(friendship)
    db.commit()
    db.refresh(friendship)

    return friendship


def accept_friend_request(
    db: Session, friendship_id: int, current_user: User
) -> Friendship:
    """
    Accept a pending friend request.

    Args:
        db: Database session
        friendship_id: ID of the friendship to accept
        current_user: User accepting the request

    Returns:
        Updated Friendship object

    Raises:
        HTTPException: If friendship not found, not pending, or user is not addressee
    """
    friendship = db.query(Friendship).filter(
        Friendship.friendship_id == friendship_id
    ).first()

    if not friendship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Friend request not found"
        )

    # Only the addressee can accept
    if friendship.addressee_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only accept friend requests sent to you"
        )

    if friendship.status != FriendshipStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This friend request is not pending (status: {friendship.status.value})"
        )

    # Accept the request
    friendship.status = FriendshipStatus.accepted
    friendship.responded_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(friendship)

    return friendship


def remove_friend(db: Session, friendship_id: int, current_user: User) -> dict:
    """
    Remove a friend or reject a friend request.

    Either user in the friendship can remove it.

    Args:
        db: Database session
        friendship_id: ID of the friendship to remove
        current_user: User removing the friend

    Returns:
        Success message

    Raises:
        HTTPException: If friendship not found or user not part of friendship
    """
    friendship = db.query(Friendship).filter(
        Friendship.friendship_id == friendship_id
    ).first()

    if not friendship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Friendship not found"
        )

    # Check if current user is part of this friendship
    if current_user.user_id not in [friendship.requester_id, friendship.addressee_id]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not part of this friendship"
        )

    db.delete(friendship)
    db.commit()

    action = "rejected" if friendship.status == FriendshipStatus.pending else "removed"
    return {"message": f"Friend {action} successfully"}


def get_friends_list(db: Session, current_user: User) -> list[FriendListItem]:
    """
    Get all accepted friends for the current user.

    Args:
        db: Database session
        current_user: User requesting friends list

    Returns:
        List of FriendListItem objects
    """
    friendships = db.query(Friendship).filter(
        and_(
            or_(
                Friendship.requester_id == current_user.user_id,
                Friendship.addressee_id == current_user.user_id
            ),
            Friendship.status == FriendshipStatus.accepted
        )
    ).all()

    friends = []
    for friendship in friendships:
        # Determine which user is the friend (not the current user)
        if friendship.requester_id == current_user.user_id:
            friend_user = friendship.addressee
        else:
            friend_user = friendship.requester

        friends.append(FriendListItem(
            friendship_id=friendship.friendship_id,
            user_id=friend_user.user_id,
            username=friend_user.username,
            since=friendship.responded_at or friendship.created_at
        ))

    return friends


def get_pending_requests(db: Session, current_user: User) -> list[Friendship]:
    """
    Get all incoming pending friend requests for the current user.

    Args:
        db: Database session
        current_user: User requesting pending requests

    Returns:
        List of Friendship objects where user is addressee and status is pending
    """
    return db.query(Friendship).filter(
        and_(
            Friendship.addressee_id == current_user.user_id,
            Friendship.status == FriendshipStatus.pending
        )
    ).all()
