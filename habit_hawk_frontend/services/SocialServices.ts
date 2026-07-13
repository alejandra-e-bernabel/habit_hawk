/**
 * Social service for friendship management
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "./api";
import type {
  FriendRequestCreate,
  FriendshipResponse,
  FriendListItem,
} from "@/types/social";

const TOKEN_KEY = "@habit_hawk_token";

/**
 * Get stored authentication token
 */
async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

/**
 * Send a friend request to another user by username
 */
export async function sendFriendRequest(
  username: string
): Promise<FriendshipResponse> {
  const token = await getToken();
  const data: FriendRequestCreate = { username };

  return await apiFetch<FriendshipResponse>("/friends/request", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Accept a pending friend request
 */
export async function acceptFriendRequest(
  friendshipId: number
): Promise<FriendshipResponse> {
  const token = await getToken();

  return await apiFetch<FriendshipResponse>(
    `/friends/${friendshipId}/accept`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

/**
 * Remove a friend or reject a friend request
 */
export async function removeFriend(
  friendshipId: number
): Promise<{ message: string }> {
  const token = await getToken();

  return await apiFetch<{ message: string }>(`/friends/${friendshipId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Get list of all accepted friends
 */
export async function getFriends(): Promise<FriendListItem[]> {
  const token = await getToken();

  return await apiFetch<FriendListItem[]>("/friends", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Get list of incoming pending friend requests
 */
export async function getPendingRequests(): Promise<FriendshipResponse[]> {
  const token = await getToken();

  return await apiFetch<FriendshipResponse[]>("/friends/pending", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
