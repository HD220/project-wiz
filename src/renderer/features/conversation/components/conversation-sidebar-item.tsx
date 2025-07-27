import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { MoreHorizontal, Archive } from "lucide-react";
import { useState } from "react";

import type { UserSummary } from "@/main/features/user/user.service";

import { Button } from "@/renderer/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";
import { cn } from "@/renderer/lib/utils";
import { useAuth } from "@/renderer/contexts/auth.context";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";

import { ArchiveConversationDialog } from "./archive-conversation-dialog";
import { ConversationAvatar } from "./conversation-avatar";

import type { ConversationWithLastMessage } from "../types";

interface ConversationSidebarItemProps {
  conversation: ConversationWithLastMessage;
  availableUsers?: UserSummary[];
}

function ConversationSidebarItem({
  conversation,
  availableUsers = [],
}: ConversationSidebarItemProps) {
  const queryClient = useQueryClient();
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const { user } = useAuth();

  // Archive conversation mutation
  const archiveMutation = useApiMutation(
    () => window.api.conversations.archive(conversation.id),
    {
      successMessage: "Conversation archived",
      errorMessage: "Failed to archive conversation",
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      },
    },
  );

  // Inline logic for display name - simplified
  const conversationName = conversation.name || "Unnamed Conversation";

  // Inline logic for message preview with proper truncation
  const messagePreview = conversation.lastMessage
    ? conversation.lastMessage.content.length > 30
      ? `${conversation.lastMessage.content.substring(0, 30)}...`
      : conversation.lastMessage.content
    : "No messages yet";

  // Inline logic for time formatting - consistent with other components
  const formattedTime = conversation.lastMessage
    ? (() => {
        try {
          const now = new Date();
          const messageTime = new Date(conversation.lastMessage.createdAt);
          const diffInMinutes =
            Math.abs(now.getTime() - messageTime.getTime()) / 60000;
          const diffInHours = diffInMinutes / 60;
          const diffInDays = diffInHours / 24;

          if (diffInMinutes < 1) return "now";
          if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m`;
          if (diffInHours < 24) return `${Math.floor(diffInHours)}h`;
          if (diffInDays < 7) return `${Math.floor(diffInDays)}d`;

          return messageTime.toLocaleDateString([], {
            month: "short",
            day: "numeric",
          });
        } catch {
          return "";
        }
      })()
    : "";

  // Archive handlers - inline logic
  const handleArchive = () => setShowArchiveDialog(true);
  const handleConfirmArchive = () => archiveMutation.mutate(conversation.id);
  const handleUnarchive = () => {
    // TODO: Implement unarchive functionality when backend supports it
  };

  // Unread messages logic - placeholder for future implementation
  const hasUnreadMessages = conversation.lastMessage && false; // TODO: Implement proper unread logic

  return (
    <div className="group relative conversation-item-enter">
      <Link
        to="/user/dm/$conversationId"
        params={{ conversationId: conversation.id }}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg transition-all duration-200",
          "hover:bg-accent/70 hover:shadow-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          conversation.archivedAt && "opacity-60",
          hasUnreadMessages && "bg-accent/30",
        )}
        activeProps={{
          className: "bg-accent text-accent-foreground shadow-sm",
        }}
      >
        {/* Avatar with status indicator */}
        <div className="relative flex-shrink-0">
          <ConversationAvatar
            participants={conversation.participants}
            availableUsers={availableUsers}
            currentUserId={user?.id}
            size="md"
            className="ring-1 ring-border/20 shadow-sm"
            showStatus={true}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Top row: Name and time */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={cn(
                  "text-sm font-semibold truncate transition-colors",
                  conversation.archivedAt &&
                    "line-through text-muted-foreground",
                  hasUnreadMessages ? "text-foreground" : "text-foreground/90",
                )}
              >
                {conversationName}
              </span>
              {hasUnreadMessages && (
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 animate-pulse" />
              )}
            </div>
            {formattedTime && (
              <span
                className={cn(
                  "text-xs whitespace-nowrap transition-colors",
                  hasUnreadMessages
                    ? "text-primary font-medium"
                    : "text-muted-foreground",
                )}
              >
                {formattedTime}
              </span>
            )}
          </div>

          {/* Bottom row: Last message preview */}
          <div
            className={cn(
              "text-xs truncate leading-tight transition-colors",
              hasUnreadMessages
                ? "text-muted-foreground font-medium"
                : "text-muted-foreground/80",
            )}
          >
            {messagePreview}
          </div>
        </div>

        {/* Actions menu */}
        <div
          className={cn(
            "opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0",
          )}
          onClick={(e) => e.preventDefault()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-6 w-6 p-0 rounded-md transition-colors",
                  "hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                )}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
                <span className="sr-only">Conversation options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 shadow-lg border-border/50"
            >
              {!conversation.archivedAt ? (
                <DropdownMenuItem
                  onClick={handleArchive}
                  className="text-sm py-2.5 px-3 focus:bg-accent/80 cursor-pointer"
                >
                  <Archive className="h-4 w-4 mr-3 text-muted-foreground" />
                  Archive Conversation
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={handleUnarchive}
                  className="text-sm py-2.5 px-3 focus:bg-accent/80 cursor-pointer"
                >
                  <Archive className="h-4 w-4 mr-3 text-muted-foreground" />
                  Unarchive Conversation
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Link>

      {/* Archive confirmation dialog */}
      <ArchiveConversationDialog
        open={showArchiveDialog}
        onClose={() => setShowArchiveDialog(false)}
        onConfirm={handleConfirmArchive}
        conversationName={conversationName}
        isLoading={archiveMutation.isPending}
      />
    </div>
  );
}

export { ConversationSidebarItem };
