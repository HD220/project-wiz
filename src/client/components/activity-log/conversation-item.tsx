import React from "react";

interface ConversationItemProps {
  id: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
  selected: boolean;
  onSelect: () => void;
  formatDate: (dateString?: string) => string;
}

export function ConversationItem({
  id,
  title,
  createdAt,
  updatedAt,
  selected,
  onSelect,
  formatDate,
}: ConversationItemProps) {
  return (
    <div
      key={id}
      onClick={onSelect}
      className={`p-2 rounded cursor-pointer border ${
        selected ? "bg-blue-100 border-blue-400" : "hover:bg-gray-100"
      }`}
    >
      <div className="font-semibold">{title || "Sem título"}</div>
      <div className="text-xs text-gray-500">
        {formatDate(updatedAt || createdAt)}
      </div>
    </div>
  );
}