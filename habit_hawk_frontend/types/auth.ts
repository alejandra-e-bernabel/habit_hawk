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
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  user_id: number;
  username: string;
  timezone: string;
}

export interface AuthError {
  detail: string;
  status?: number;
}
