import React from "react";

import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { cn } from "@/ui/lib/utils";

import { ChatMessage } from "./MessageItem";

interface MessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
  senderName: string;
  time: string;
}

export function MessageBubble({
  message,
  isCurrentUser,
  senderName,
  time,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "max-w-[70%] p-2.5 rounded-lg shadow-sm",
        isCurrentUser
          ? "bg-sky-600 text-white rounded-br-none"
          : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none",
        message.type === "error"
          ? "bg-red-100 dark:bg-red-800/50 border border-red-500/50"
          : "",
      )}
    >
      {!message.isContinuation && (
        <p
          className={cn(
            "text-xs font-semibold mb-0.5",
            isCurrentUser
              ? "text-sky-100"
              : "text-slate-600 dark:text-slate-300",
          )}
        >
          {senderName}
        </p>
      )}
      <MarkdownRenderer
        content={message.content}
        proseClassName="prose-p:my-0.5"
      />
      {message.type === "error" && (
        <span className="text-red-500 dark:text-red-400 ml-1 text-xs inline-block mt-0.5">
          (Erro)
        </span>
      )}
      <p
        className={cn(
          "text-xs mt-1 text-right",
          isCurrentUser
            ? "text-sky-200/80"
            : "text-slate-400 dark:text-slate-500",
        )}
      >
        {time}
      </p>
    </div>
  );
}
