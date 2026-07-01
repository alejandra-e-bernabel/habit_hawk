/**
 * API configuration and utilities
 */

// For development, use localhost
// For production, this should come from environment variables
const getApiUrl = (): string => {
  // Check if we have an environment variable (Expo's EXPO_PUBLIC_ prefix)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Default to localhost for development
  // Use 10.0.2.2 for Android emulator, localhost for iOS/web
  const isAndroid = typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
  return isAndroid ? "http://10.0.2.2:8000" : "http://localhost:8000";
};

export const API_BASE_URL = getApiUrl();

// Log the API URL on initialization
console.log('[API] Base URL configured as:', API_BASE_URL);
console.log('[API] Platform:', typeof navigator !== "undefined" ? navigator.userAgent : 'Node.js/Server');

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
    this.name = "ApiError";
  }
}

/**
 * Generic fetch wrapper with error handling
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Debug logging
  console.log(`[API] ${options.method || 'GET'} ${url}`);
  console.log('[API] Request body:', options.body);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    console.log(`[API] Response status: ${response.status}`);
    console.log(`[API] Response headers:`, response.headers);

    // Parse response body
    const data = await response.json();
    console.log('[API] Response data:', data);

    // Check if request was successful
    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.detail || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return data as T;
  } catch (error) {
    console.error('[API] Fetch error:', error);

    // If it's already an ApiError, rethrow it
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or parsing errors
    if (error instanceof Error) {
      console.error('[API] Error name:', error.name);
      console.error('[API] Error message:', error.message);
      console.error('[API] Error stack:', error.stack);
      throw new ApiError(0, `Network error: ${error.message}`);
    }

    // Unknown error
    throw new ApiError(0, "An unknown error occurred");
  }
}
