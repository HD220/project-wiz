import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { MoreHorizontal, Archive } from "lucide-react";

import type { UserSummary } from "@/main/features/user/user.service";

import { Button } from "@/renderer/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";
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
    return content.length > 50 ? `${content.substring(0, 50)}...` : content;
  };

  // Format the last message time
  const formatLastMessageTime = () => {
    if (!conversation.lastMessage) {
      return "";
    }

    const now = new Date();
    const messageTime = new Date(conversation.lastMessage.createdAt);
    const diffInHours = Math.abs(now.getTime() - messageTime.getTime()) / 36e5;

    if (diffInHours < 24) {
      return messageTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return messageTime.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
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

  return (
    <div className="group">
      <Link
        to="/user/dm/$conversationId"
        params={{ conversationId: conversation.id }}
        className="flex items-center gap-3 px-3 py-2 hover:bg-accent/50 rounded-md transition-colors"
        activeProps={{
          className: "bg-accent text-accent-foreground",
        }}
      >
        <div className="flex-shrink-0">
          <ConversationAvatar
            participants={conversation.participants}
            availableUsers={availableUsers}
            currentUserId={user?.id}
            size="md"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium truncate">
              {getConversationName()}
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              {formatLastMessageTime()}
            </span>
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {getLastMessagePreview()}
          </div>
        </div>

        <div
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.preventDefault()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!conversation.archivedAt ? (
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleUnarchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  Unarchive
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
