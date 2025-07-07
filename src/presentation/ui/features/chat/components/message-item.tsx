import React from "react";

import { cn } from "@/ui/lib/utils";

import { MessageAvatar } from "./message-avatar";
import { MessageBubble } from "./message-bubble";

export interface ChatMessageSender {
  id: string;
  name: string;
  type: "user" | "agent";
  avatarUrl?: string;
}
export interface ChatMessage {
  id: string;
  sender: ChatMessageSender;
  content: string;
  timestamp: string | Date;
  type?: "text" | "tool_call" | "tool_response" | "error" | "system";
  isContinuation?: boolean;
}

interface MessageItemProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

export function MessageItem({ message, isCurrentUser }: MessageItemProps) {
  const senderName =
    message.sender.type === "user" ? "Você" : message.sender.name;
  const time =
    message.timestamp instanceof Date
      ? message.timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : message.timestamp;

  if (message.type === "system") {
    return (
      <div className="py-2 px-4 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isCurrentUser ? "justify-end" : "justify-start",
        message.isContinuation ? "mt-1" : "mt-3",
      )}
    >
      {!isCurrentUser && (
        <MessageAvatar
          sender={message.sender}
          isCurrentUser={isCurrentUser}
          isContinuation={message.isContinuation || false}
        />
      )}

      <MessageBubble
        message={message}
        isCurrentUser={isCurrentUser}
        senderName={senderName}
        time={time}
      />

      {isCurrentUser && (
        <MessageAvatar
          sender={message.sender}
          isCurrentUser={isCurrentUser}
          isContinuation={message.isContinuation || false}
        />
      )}
    </div>
  );
}

