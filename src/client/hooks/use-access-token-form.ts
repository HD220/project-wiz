/**
 * useAccessTokenForm hook
 *
 * Encapsulates all state and logic for the access token form.
 * - Manages showToken, error, and success states.
 * - Exposes handlers: handleToggleShow, handleInputChange, handleSubmit.
 * - Receives accessToken (string) and setAccessToken (function) as parameters.
 * - Integrates with i18n (useLingui) for messages and labels.
 * - Returns all states and handlers needed by the form component.
 * - Designed for reusability and testability.
 */

import { useState, useCallback } from "react";
import { useLingui } from "@lingui/react";
import { validateGitHubToken } from "../lib/validate-github-token";

type UseAccessTokenFormParams = {
  accessToken: string;
  setAccessToken: (token: string) => void;
};

type UseAccessTokenFormResult = {
  showToken: boolean;
  error: string | null;
  success: string | null;
  handleToggleShow: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export function useAccessTokenForm({
  accessToken,
  setAccessToken,
}: UseAccessTokenFormParams): UseAccessTokenFormResult {
  const { i18n } = useLingui();
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleToggleShow = useCallback(() => {
    setShowToken((prev) => !prev);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAccessToken(e.target.value);
      setError(null);
      setSuccess(null);
    },
    [setAccessToken]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      setSuccess(null);

      if (!accessToken || !validateGitHubToken(accessToken)) {
        setError(i18n._("Invalid token format"));
        return;
      }

      setSuccess(i18n._("Token saved successfully"));
    },
    [accessToken, i18n]
  );

  return {
    showToken,
    error,
    success,
    handleToggleShow,
    handleInputChange,
    handleSubmit,
  };
}