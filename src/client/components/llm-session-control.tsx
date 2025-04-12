import React from "react";
import { SessionStatus } from "../hooks/use-sessions";
import { useLlmSessionControl } from "../hooks/use-llm-session-control";

const statusLabels: Record<SessionStatus, string> = {
  running: "Running",
  paused: "Paused",
  cancelled: "Cancelled",
};

const statusColors: Record<SessionStatus, string> = {
  running: "green",
  paused: "orange",
  cancelled: "red",
};

export const LlmSessionControl: React.FC = () => {
  const {
    sessions,
    pauseSession,
    cancelSession,
    restoreSession,
    removeSession,
    newSessionName,
    handleInputChange,
    handleFormSubmit,
  } = useLlmSessionControl();

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, maxWidth: 480 }}>
      <h3 style={{ marginTop: 0, marginBottom: 12 }}>LLM Sessions</h3>
      <div style={{ marginBottom: 16 }}>
        <form
          onSubmit={handleFormSubmit}
          style={{ display: "flex", gap: 8, marginBottom: 12 }}
        >
          <input
            type="text"
            placeholder="New session name"
            value={newSessionName}
            onChange={handleInputChange}
            style={{ flex: 1, padding: 4 }}
            aria-label="New session name"
          />
          <button type="submit" disabled={!newSessionName.trim()}>
            Create
          </button>
        </form>
        {sessions.length === 0 && (
          <div style={{ color: "#888", fontSize: 14 }}>No sessions available.</div>
        )}
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {sessions.map((session) => (
            <li
              key={session.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 6,
                marginBottom: 10,
                padding: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#fafbfc",
              }}
            >
              <div>
                <strong>{session.name}</strong>
                <span
                  style={{
                    color: statusColors[session.status],
                    fontWeight: "bold",
                    marginLeft: 10,
                  }}
                  aria-label={`Status: ${statusLabels[session.status]}`}
                >
                  {statusLabels[session.status]}
                </span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => pauseSession(session.id)}
                  disabled={session.status !== "running"}
                  aria-label="Pause session"
                  title="Pause"
                >
                  Pause
                </button>
                <button
                  onClick={() => cancelSession(session.id)}
                  disabled={session.status === "cancelled"}
                  aria-label="Cancel session"
                  title="Cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={() => restoreSession(session.id)}
                  disabled={session.status === "running"}
                  aria-label="Restore session"
                  title="Restore"
                >
                  Restore
                </button>
                <button
                  onClick={() => removeSession(session.id)}
                  aria-label="Remove session"
                  title="Remove"
                  style={{ color: "red" }}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LlmSessionControl;