import { useState } from "react";

/**
 * Hook for managing and validating the new branch name state.
 * @returns {object} State and handlers for new branch name.
 */
export interface UseNewBranchResult {
  /** The current new branch name value */
  newBranch: string;
  /** Handler to update the new branch name */
  setNewBranch: (name: string) => void;
  /** Whether the new branch name is valid (not empty and no spaces) */
  isValid: boolean;
  /** Optional validation error message */
  error?: string;
}

export function useNewBranch(): UseNewBranchResult {
  const [newBranch, setNewBranch] = useState("");
  const isValid = !!newBranch && !/\s/.test(newBranch);
  let error: string | undefined = undefined;
  if (newBranch.length > 0 && /\s/.test(newBranch)) {
    error = "Branch name cannot contain spaces.";
  } else if (newBranch.length > 0 && !isValid) {
    error = "Invalid branch name.";
  }

  return {
    newBranch,
    setNewBranch,
    isValid,
    error,
  };
}