import { useEffect } from "react";
import { getAccessToken, clearTokens } from "./auth-storage";
import { verifySession } from "./auth-api";
import { AuthUser } from "../types/auth";

/**
 * Hook to verify user session on mount.
 * Receives setUser and setLoading to decouple from global state.
 */
export function useVerifySessionOnMount(
  setUser: (user: AuthUser | null) => void,
  setLoading: (loading: boolean) => void
) {
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    verifySession(token)
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        clearTokens();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [setUser, setLoading]);
}