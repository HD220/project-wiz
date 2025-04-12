import React from "react";

type StatusType = "loading" | "error" | "empty";

interface StatusMessageProps {
  type: StatusType;
  children?: React.ReactNode;
  message?: string;
  className?: string;
}

export function StatusMessage({
  type,
  children,
  message,
  className = "",
}: StatusMessageProps) {
  const role = type === "error" ? "alert" : "status";
  const baseClass =
    type === "error"
      ? "text-red-600"
      : type === "loading"
      ? "text-gray-500"
      : "text-gray-400";
  return (
    <div
      role={role}
      aria-live="polite"
      className={`${baseClass} ${className}`.trim()}
      tabIndex={0}
    >
      {message ? message : children}
    </div>
  );
}

export default StatusMessage;