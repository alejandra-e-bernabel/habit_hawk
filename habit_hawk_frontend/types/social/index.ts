/**
 * Social/Friendship types matching backend Pydantic schemas
 */

// Enums
export enum FriendshipStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  BLOCKED = "blocked",
}

// Request/Response types
export interface FriendRequestCreate {
  username: string;
}

export interface UserBasicInfo {
  user_id: number;
  username: string;
}

export interface FriendshipResponse {
  friendship_id: number;
  requester: UserBasicInfo;
  addressee: UserBasicInfo;
  status: FriendshipStatus;
  created_at: string; // ISO datetime string
  responded_at: string | null; // ISO datetime string
}

export interface FriendListItem {
  friendship_id: number;
  user_id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  profile_icon_name?: string;
  profile_image_url?: string;
  since: string; // ISO datetime string - when friendship was accepted
}
