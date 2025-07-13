import { useState } from "react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Edit, Trash2, Reply, Bot, CheckCircle, Info } from "lucide-react";

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

export function MessageItem({
  message,
  onEdit,
  onDelete,
  onReply,
  showActions = true,
}: MessageItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleEdit = () => {
    if (editContent.trim() !== message.content) {
      onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };

  const getMessageIcon = () => {
    switch (message.messageType) {
      case "task_update":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "system":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getMessageBadge = () => {
    if (message.senderType === "agent") {
      return (
        <Badge variant="secondary" className="ml-2 text-xs">
          BOT
        </Badge>
      );
    }
    return null;
  };

  const renderMessageContent = () => {
    // Process mentions first
    let contentWithMentions = message.content;
    if (message.mentions) {
      message.mentions.forEach((mention) => {
        contentWithMentions = contentWithMentions.replace(
          new RegExp(`@${mention}`, "g"),
          `<span class="bg-brand-500/20 text-brand-400 px-1 rounded">@${mention}</span>`,
        );
      });
    }

    if (message.messageType === "system") {
      return (
        <div className="bg-blue-900/20 border-l-4 border-blue-500 p-3 rounded-r">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-blue-500" />
            <div className="text-blue-300 prose prose-sm prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                // eslint-disable-next-line react/no-children-prop
                children={message.content} // System messages likely don't have mentions
              />
            </div>
            {/* <span className="text-blue-300">{message.content}</span> */}
          </div>
        </div>
      );
    }

    // For regular text messages
    return (
      <div className="text-gray-300 prose prose-sm prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          // eslint-disable-next-line react/no-children-prop
          children={contentWithMentions}
          // Components prop can be used to customize rendering of specific elements
          // e.g., to handle mentions if they were parsed as a specific markdown element
          components={
            {
              // Example: Customizing how links are rendered
              // a: ({node, ...props}) => <a {...props} className="text-blue-400 hover:underline" />
              // With rehypeRaw, the explicitly created span for mentions should be rendered.
            }
          }
        />
      </div>
    );
  };

  return (
    <div
      className={cn(
        "group hover:bg-gray-600/30 p-2 rounded relative",
        message.mentions?.includes("user") &&
          "bg-yellow-500/10 border-l-2 border-yellow-500",
      )}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      <div className="flex space-x-3">
        {/* Avatar */}
        <Avatar className="w-10 h-10 mt-1">
          <AvatarImage
            src={
              message.senderType === "agent"
                ? `/agents/${message.senderId}.png`
                : undefined
            }
          />
          <AvatarFallback
            className={cn(
              message.senderType === "agent" ? "bg-purple-500" : "bg-brand-500",
            )}
          >
            {message.senderType === "agent" && <Bot className="h-5 w-5" />}
            {message.senderType === "user" &&
              message.senderName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-1">
            <span
              className={cn(
                "font-medium",
                message.senderType === "agent"
                  ? "text-purple-300"
                  : "text-white",
              )}
            >
              {message.senderName}
            </span>
            {getMessageBadge()}
            <span className="text-xs text-gray-500">
              {format(message.timestamp, "HH:mm")}
            </span>
            {message.isEdited && (
              <span className="text-xs text-gray-500">(edited)</span>
            )}
            {getMessageIcon()}
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-gray-300 resize-none"
                rows={3}
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleEdit}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            renderMessageContent()
          )}
        </div>
      </div>

      {/* Actions Menu */}
      {showMenu && showActions && (
        <div className="absolute top-0 right-4 bg-gray-800 border border-gray-600 rounded shadow-lg flex">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={() => onReply?.(message.id)}
          >
            <Reply className="h-4 w-4" />
          </Button>
          {message.senderType === "user" && (
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-red-400 hover:text-red-300"
            onClick={() => onDelete(message.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
