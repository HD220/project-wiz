import { Bot, Hash, UserCircle2 } from "lucide-react";
import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/ui/lib/utils";
import { ConversationItem } from "./ConversationList";

interface ConversationListItemProps {
  conv: ConversationItem;
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

export function ConversationListItem({
  conv,
  selectedConversationId,
  onSelectConversation,
}: ConversationListItemProps) {
  return (
    <button
      key={conv.id}
      onClick={() => onSelectConversation(conv.id)}
      className={cn(
        "w-full flex items-center space-x-2.5 p-2 rounded-md text-left transition-colors",
        "hover:bg-slate-200 dark:hover:bg-slate-700/60",
        conv.id === selectedConversationId
          ? "bg-sky-100 dark:bg-sky-700/50 text-sky-700 dark:text-sky-300 font-medium"
          : "text-slate-700 dark:text-slate-300",
      )}
      aria-current={conv.id === selectedConversationId ? "page" : undefined}
    >
      <Avatar className="h-7 w-7 text-xs flex-shrink-0">
        {conv.avatarUrl ? (
          <AvatarImage src={conv.avatarUrl} alt={conv.name} />
        ) : null}
        <AvatarFallback
          className={cn(
            "text-white",
            conv.type === "agent"
              ? "bg-emerald-500"
              : conv.type === "dm"
                ? "bg-purple-500"
                : "bg-slate-400 dark:bg-slate-600",
          )}
        >
          {conv.type === "channel" ? (
            <Hash size={14} />
          ) : conv.type === "agent" ? (
            <Bot size={14} />
          ) : (
            conv.name.substring(0, 1).toUpperCase() || (
              <UserCircle2 size={14} />
            )
          )}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <span className="text-sm truncate block leading-tight">
          {conv.name}
        </span>
        {conv.lastMessage && (
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate block leading-tight">
            {conv.lastMessage}
          </span>
        )}
      </div>
      <div className="flex flex-col items-end flex-shrink-0 text-xs">
        {conv.timestamp && (
          <span className="text-slate-400 dark:text-slate-500 mb-0.5">
            {conv.timestamp}
          </span>
        )}
        {conv.unreadCount && conv.unreadCount > 0 && (
          <span className="bg-red-500 text-white font-semibold rounded-full px-1.5 py-0.5 text-[10px] leading-none">
            {conv.unreadCount}
          </span>
        )}
      </div>
    </button>
  );
}
