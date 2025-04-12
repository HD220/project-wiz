import { AuthSession, AuthUser } from "../types/auth";
import {
  saveTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
} from "./auth-storage";
import {
  register as apiRegister,
  login as apiLogin,
  logout as apiLogout,
  refresh as apiRefresh,
} from "./auth-api";
import { handleAuthError } from "../lib/handle-auth-error";

/**
 * Auth Actions Layer
 * 
 * Responsibilities:
 * - Encapsulate authentication logic as pure functions.
 * - Do not manipulate UI state or React hooks directly.
 * - Return predictable result objects or throw errors.
 * - All side effects (state updates, UI feedback) must be handled by the consumer (e.g., hooks).
 * 
 * Contract:
 * - All functions are async and return either a result object or throw an error.
 * - Errors are always thrown; never handled via side effects.
 * - No React state setters or UI dependencies.
 * 
 * Usage:
 * - Hooks (e.g., useAuth) are responsible for calling these actions and updating UI state accordingly.
 */

/**
 * Register a new user.
 * @param email User email
 * @param password User password
 * @returns {Promise<{ user: AuthUser }>} On success, returns user object. Throws on error.
 */
export async function registerUser(
  email: string,
  password: string
): Promise<{ user: AuthUser }> {
  try {
    const user = await apiRegister(email, password);
    return { user };
  } catch (err) {
    throw handleAuthError(err, "Registration failed");
  }
}

/**
 * Login user and persist session.
 * @param email User email
 * @param password User password
 * @returns {Promise<{ session: AuthSession }>} On success, returns session object. Throws on error.
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ session: AuthSession }> {
  try {
    const session = await apiLogin(email, password);
    saveTokens(session);
    return { session };
  } catch (err) {
    throw handleAuthError(err, "Login failed");
  }
}

/**
 * Logout user and clear session.
 * @returns {Promise<{ success: true }>} On success, returns { success: true }. Throws on error.
 */
export async function logoutUser(): Promise<{ success: true }> {
  const token = getAccessToken();
  try {
    await apiLogout(token);
  } finally {
    clearTokens();
  }
  return { success: true };
}

/**
 * Refresh session using refresh token.
 * @returns {Promise<{ session: AuthSession }>} On success, returns session object. Throws on error.
 */
export async function refreshSession(): Promise<{ session: AuthSession }> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");
  try {
    const session = await apiRefresh(refreshToken);
    saveTokens(session);
    return { session };
  } catch (err) {
    clearTokens();
    throw handleAuthError(err, "Session refresh failed");
  }
}