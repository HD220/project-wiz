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
  DropdownMenuSeparator,
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

  // Get conversation display name
  const getConversationName = () => {
    // Use the generated name from backend (should always exist now)
    return conversation.name || "Unnamed Conversation";
  };

  // Get the last message preview
  const getLastMessagePreview = () => {
    if (!conversation.lastMessage) {
      return "No messages yet";
    }

    const content = conversation.lastMessage.content;
    return content.length > 30 ? `${content.substring(0, 30)}...` : content;
  };

  // Format the last message time
  const formatLastMessageTime = () => {
    if (!conversation.lastMessage) {
      return "";
    }

    const now = new Date();
    const messageTime = new Date(conversation.lastMessage.createdAt);
    const diffInMinutes =
      Math.abs(now.getTime() - messageTime.getTime()) / 60000;
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;

    if (diffInMinutes < 1) {
      return "now";
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d`;
    } else {
      return messageTime.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  const handleArchive = () => {
    setShowArchiveDialog(true);
  };

  const handleConfirmArchive = () => {
    archiveMutation.mutate(conversation.id);
  };

  const handleUnarchive = () => {
    // TODO: Implement unarchive functionality
  };

  // Check if conversation has unread messages (placeholder logic)
  const hasUnreadMessages = conversation.lastMessage && false; // TODO: Implement unread logic

  return (
    <div className="group relative conversation-item-enter">
      <Link
        to="/user/dm/$conversationId"
        params={{ conversationId: conversation.id }}
        className={cn(
          "flex items-center gap-3 px-2 py-2 mx-2 rounded-lg transition-all duration-200",
          "hover:bg-accent/70 hover:shadow-sm hover:scale-[1.02]",
          "active:scale-[0.98] active:bg-accent/90",
          conversation.archivedAt && "opacity-60",
          hasUnreadMessages && "bg-accent/30",
        )}
        activeProps={{
          className: "bg-accent text-accent-foreground shadow-md scale-[1.02]",
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
                  hasUnreadMessages && "text-foreground",
                  !hasUnreadMessages && "text-foreground/90",
                )}
              >
                {getConversationName()}
              </span>
              {hasUnreadMessages && (
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 status-pulse" />
              )}
            </div>
            {formatLastMessageTime() && (
              <span
                className={cn(
                  "text-xs whitespace-nowrap transition-colors",
                  hasUnreadMessages
                    ? "text-primary font-medium"
                    : "text-muted-foreground",
                )}
              >
                {formatLastMessageTime()}
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
            {getLastMessagePreview()}
          </div>
        </div>

        {/* Actions menu */}
        <div
          className={cn(
            "opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0",
            "hover:bg-accent-foreground/10 rounded-md p-1.5 transform hover:scale-110",
          )}
          onClick={(e) => e.preventDefault()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 hover:bg-accent-foreground/20 transition-colors"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 shadow-lg border-border/50"
            >
              {!conversation.archivedAt ? (
                <DropdownMenuItem
                  onClick={handleArchive}
                  className="text-sm py-2.5 focus:bg-accent/80"
                >
                  <Archive className="h-4 w-4 mr-3" />
                  Archive Conversation
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={handleUnarchive}
                  className="text-sm py-2.5 focus:bg-accent/80"
                >
                  <Archive className="h-4 w-4 mr-3" />
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
        conversationName={getConversationName()}
        isLoading={archiveMutation.isPending}
      />
    </div>
  );
}

export { ConversationSidebarItem };
