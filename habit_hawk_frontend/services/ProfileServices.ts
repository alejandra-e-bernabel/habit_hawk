/**
 * Profile service for updating user profile information
 */

import { apiFetch } from "./api";
import { getStoredToken } from "./AuthServices";
import type { UserResponse } from "@/types/auth";

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  profile_icon_name?: string;
}

/**
 * Update the current user's profile
 */
export async function updateProfile(
  profileData: ProfileUpdateData
): Promise<UserResponse> {
  const token = await getStoredToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await apiFetch<UserResponse>("/auth/profile", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  return response;
}
