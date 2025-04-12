import { useState } from "react";

/**
 * Hook for managing and validating the commit message state.
 * @returns {object} State and handlers for commit message.
 */
export interface UseCommitMessageResult {
  /** The current commit message value */
  commitMessage: string;
  /** Handler to update the commit message */
  setCommitMessage: (msg: string) => void;
  /** Whether the commit message is valid (not empty) */
  isValid: boolean;
  /** Optional validation error message */
  error?: string;
}

export function useCommitMessage(): UseCommitMessageResult {
  const [commitMessage, setCommitMessage] = useState("");
  const isValid = commitMessage.trim().length > 0;
  const error = !isValid && commitMessage.length > 0 ? "Commit message cannot be empty." : undefined;

  return {
    commitMessage,
    setCommitMessage,
    isValid,
    error,
  };
}