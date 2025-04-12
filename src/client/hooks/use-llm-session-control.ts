import { useState, FormEvent, ChangeEvent } from "react";
import { useSessions } from "./use-sessions";

/**
 * Hook to manage the state and handlers for the LLM session creation form.
 * Isolates UI state and logic from the presentation component.
 */
export function useLlmSessionControl() {
  const {
    sessions,
    createSession,
    pauseSession,
    cancelSession,
    restoreSession,
    removeSession,
  } = useSessions();

  const [newSessionName, setNewSessionName] = useState("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewSessionName(e.target.value);
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newSessionName.trim()) {
      createSession(newSessionName.trim());
      setNewSessionName("");
    }
  };

  return {
    sessions,
    createSession,
    pauseSession,
    cancelSession,
    restoreSession,
    removeSession,
    newSessionName,
    setNewSessionName,
    handleInputChange,
    handleFormSubmit,
  };
}