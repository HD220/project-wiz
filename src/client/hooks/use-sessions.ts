import { useState, useCallback } from "react";

export type SessionStatus = "running" | "paused" | "cancelled";

export interface LlmSession {
  id: string;
  name: string;
  status: SessionStatus;
}

export function useSessions() {
  const [sessions, setSessions] = useState<LlmSession[]>([
    { id: "1", name: "Default Session", status: "running" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simula atualização de status de uma sessão
  const updateSessionStatus = useCallback(
    (id: string, status: SessionStatus) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
    },
    []
  );

  const createSession = useCallback((name: string) => {
    setSessions((prev) => [
      ...prev,
      {
        id: (Date.now() + Math.random()).toString(),
        name,
        status: "running",
      },
    ]);
  }, []);

  const pauseSession = useCallback((id: string) => {
    updateSessionStatus(id, "paused");
  }, [updateSessionStatus]);

  const cancelSession = useCallback((id: string) => {
    updateSessionStatus(id, "cancelled");
  }, [updateSessionStatus]);

  const restoreSession = useCallback((id: string) => {
    updateSessionStatus(id, "running");
  }, [updateSessionStatus]);

  const removeSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return {
    sessions,
    loading,
    error,
    createSession,
    pauseSession,
    cancelSession,
    restoreSession,
    removeSession,
  };
}