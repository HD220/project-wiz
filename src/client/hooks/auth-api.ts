import { AuthUser, AuthSession } from "../types/auth";
import { handleAuthError } from "../../shared/utils/handle-auth-error";

/**
 * HttpClient interface for dependency injection and testability.
 */
export interface HttpClient {
  request<T = any>(input: RequestInfo, init?: RequestInit): Promise<T>;
}

/**
 * AuthApiConfig allows dynamic endpoint configuration.
 */
export interface AuthApiConfig {
  baseUrl: string;
}

/**
 * AuthApi contract for authentication operations.
 */
export interface AuthApi {
  register(email: string, password: string): Promise<AuthUser>;
  login(email: string, password: string): Promise<AuthSession>;
  logout(token: string | null): Promise<void>;
  refresh(refreshToken: string): Promise<AuthSession>;
  verifySession(token: string): Promise<AuthUser>;
}

/**
 * Default HttpClient implementation using fetch.
 */
export const defaultHttpClient: HttpClient = {
  async request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    const response = await fetch(input, init);
    const contentType = response.headers.get("Content-Type");
    let data: any = undefined;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    }
    if (!response.ok) {
      const errorMessage =
        (data && data.error) ||
        response.statusText ||
        "Unexpected error occurred";
      throw new Error(errorMessage);
    }
    return (data !== undefined ? data : (await response.text())) as T;
  },
};

/**
 * Factory to create an AuthApi instance with injected HttpClient and config.
 */
export function createAuthApi(
  httpClient: HttpClient = defaultHttpClient,
  config: AuthApiConfig = { baseUrl: "http://localhost:3333" }
): AuthApi {
  const { baseUrl } = config;

  return {
    async register(email: string, password: string): Promise<AuthUser> {
      try {
        return await httpClient.request<AuthUser>(`${baseUrl}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
      } catch (error) {
        throw new Error(
          handleAuthError(error, "Registration failed. Please try again.")
        );
      }
    },

    async login(email: string, password: string): Promise<AuthSession> {
      try {
        return await httpClient.request<AuthSession>(`${baseUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
      } catch (error) {
        throw new Error(
          handleAuthError(error, "Login failed. Please check your credentials.")
        );
      }
    },

    async logout(token: string | null): Promise<void> {
      try {
        await httpClient.request<void>(`${baseUrl}/auth/logout`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
      } catch (error) {
        throw new Error(
          handleAuthError(error, "Logout failed. Please try again.")
        );
      }
    },

    async refresh(refreshToken: string): Promise<AuthSession> {
      try {
        return await httpClient.request<AuthSession>(`${baseUrl}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        throw new Error(
          handleAuthError(error, "Session refresh failed. Please login again.")
        );
      }
    },

    async verifySession(token: string): Promise<AuthUser> {
      try {
        return await httpClient.request<AuthUser>(`${baseUrl}/auth/session`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        throw new Error(
          handleAuthError(error, "Session verification failed.")
        );
      }
    },
  };
}