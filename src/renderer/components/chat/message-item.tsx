import { useState } from "react";
import { cn } from "@/lib/utils";
import { MessageAvatar } from "./message-avatar";
import { MessageHeader } from "./message-header";
import { MessageContent } from "./message-content";
import { MessageActions } from "./message-actions";
import { MessageEditForm } from "./message-edit-form";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderType: "user" | "agent" | "system";
  messageType: "text" | "task_update" | "system" | "file_share" | "code";
  timestamp: Date;
  isEdited?: boolean;
  replyTo?: string;
  mentions?: string[];
  attachments?: unknown[];
  metadata?: Record<string, unknown>;
}

interface MessageItemProps {
  message: Message;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  showActions?: boolean;
}

export function MessageItem({ message, onEdit, onDelete, onReply, showActions = true }: MessageItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleEditSave = (content: string) => {
    onEdit(message.id, content);
    setIsEditing(false);
  };

  const containerClasses = cn(
    "group hover:bg-gray-600/30 p-2 rounded relative",
    message.mentions?.includes("user") && "bg-yellow-500/10 border-l-2 border-yellow-500",
  );

  return (
    <div
      className={containerClasses}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      <div className="flex space-x-3">
        <MessageAvatar
          senderId={message.senderId}
          senderName={message.senderName}
          senderType={message.senderType}
        />
        <div className="flex-1 min-w-0">
          <MessageHeader
            senderName={message.senderName}
            senderType={message.senderType}
            messageType={message.messageType}
            timestamp={message.timestamp}
            isEdited={message.isEdited}
          />
          {isEditing ? (
            <MessageEditForm
              initialContent={message.content}
              onSave={handleEditSave}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <MessageContent
              content={message.content}
              messageType={message.messageType}
              mentions={message.mentions}
            />
          )}
        </div>
      </div>
      {showMenu && showActions && (
        <MessageActions
          messageId={message.id}
          senderType={message.senderType}
          onEdit={() => setIsEditing(true)}
          onDelete={onDelete}
          onReply={onReply}
        />
      )}
    </div>
  );
}