"""API routes for social/friendship features."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from auth.crud import get_current_user
from database.connection import get_db
from database.models import User
from social.crud import (
    accept_friend_request,
    get_friends_list,
    get_pending_requests,
    remove_friend,
    send_friend_request,
)
from social.schemas import (
    FriendListItem,
    FriendRequestCreate,
    FriendshipResponse,
)

router = APIRouter(prefix="/friends", tags=["Social"])


@router.post("/request", response_model=FriendshipResponse, status_code=status.HTTP_201_CREATED)
def create_friend_request(
    request_data: FriendRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Send a friend request to another user by username.

    Requires a valid JWT token in the Authorization header.
    """
    friendship = send_friend_request(db, request_data, current_user)
    return friendship


@router.put("/{friendship_id}/accept", response_model=FriendshipResponse)
def accept_friend(
    friendship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Accept a pending friend request.

    Only the addressee (person who received the request) can accept it.
    Requires a valid JWT token in the Authorization header.
    """
    friendship = accept_friend_request(db, friendship_id, current_user)
    return friendship


@router.delete("/{friendship_id}", status_code=status.HTTP_200_OK)
def remove_friendship(
    friendship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Remove a friend or reject a friend request.

    Either user in the friendship can remove it.
    Requires a valid JWT token in the Authorization header.
    """
    result = remove_friend(db, friendship_id, current_user)
    return result


@router.get("", response_model=list[FriendListItem])
def list_friends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a list of all accepted friends.

    Returns simplified friend information.
    Requires a valid JWT token in the Authorization header.
    """
    friends = get_friends_list(db, current_user)
    return friends


@router.get("/pending", response_model=list[FriendshipResponse])
def list_pending_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a list of all incoming pending friend requests.

    Only shows requests where the current user is the addressee.
    Requires a valid JWT token in the Authorization header.
    """
    pending = get_pending_requests(db, current_user)
    return pending
