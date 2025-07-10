import React from "react";
import { IDirectMessage } from "@/shared/ipc-types/domain-types";

interface MessageListProps {
  messages: IDirectMessage[];
  senderId: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, senderId }) => {
  return (
    <div className="flex-1 overflow-y-auto mb-4 border rounded p-2">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`mb-2 ${msg.senderId === senderId ? "text-right" : "text-left"}`}
        >
          <span className="font-bold">{msg.senderId}: </span>
          {msg.content}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
