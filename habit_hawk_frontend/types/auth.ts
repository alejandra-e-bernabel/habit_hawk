/**
 * Authentication types matching backend Pydantic schemas
 */

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  timezone?: string;
  first_name?: string;
  last_name?: string;
  profile_icon_name?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  user_id: number;
  username: string;
  timezone: string;
  first_name?: string;
  last_name?: string;
  profile_icon_name?: string;
  profile_image_url?: string;
}

export interface AuthError {
  detail: string;
  status?: number;
}
