import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessageSender } from "./MessageItem";

interface MessageAvatarProps {
  sender: ChatMessageSender;
  isCurrentUser: boolean;
  isContinuation: boolean;
}

export function MessageAvatar({
  sender,
  isCurrentUser,
  isContinuation,
}: MessageAvatarProps) {
  if (isCurrentUser) {
    return (
      <Avatar className="h-7 w-7">
        <AvatarFallback className="bg-sky-600 text-white">
          {sender.name.substring(0, 1).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
    );
  }

  if (isContinuation) {
    return <div className="w-7 h-7 flex-shrink-0" />;
  }

  return (
    <Avatar className="h-7 w-7">
      <AvatarImage src={sender.avatarUrl} alt={sender.name} />
      <AvatarFallback>{sender.name.substring(0, 1).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}
