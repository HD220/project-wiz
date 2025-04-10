import React from "react";

interface MessageItemProps {
  id: string;
  role: string;
  content: string;
  createdAt?: string;
  formatDate: (dateString?: string) => string;
}

export function MessageItem({
  id,
  role,
  content,
  createdAt,
  formatDate,
}: MessageItemProps) {
  return (
    <div
      key={id}
      className="border rounded p-2 flex flex-col gap-1 bg-muted"
    >
      <div className="flex justify-between text-xs text-gray-500">
        <span>{role === "user" ? "Usuário" : "Assistente"}</span>
        <span>{formatDate(createdAt)}</span>
      </div>
      <div className="whitespace-pre-wrap">{content}</div>
    </div>
  );
}