import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { MoreHorizontal, Archive, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/renderer/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";

import type { ConversationWithLastMessage } from "../types";

interface ConversationSidebarItemProps {
  conversation: ConversationWithLastMessage;
}

function ConversationSidebarItem({
  conversation,
}: ConversationSidebarItemProps) {
  const queryClient = useQueryClient();

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
    if (conversation.name) {
      return conversation.name;
    }

    // For DM conversations, use participant names
    if (conversation.type === "dm") {
      // This would typically show other participants' names
      return "Direct Message";
    }

    return "Unnamed Conversation";
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
    if (
      window.confirm(
        "Are you sure you want to archive this conversation? It will be moved to archived conversations.",
      )
    ) {
      archiveMutation.mutate(conversation.id);
    }
  };

  const handleUnarchive = () => {
    // TODO: Implement unarchive functionality
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
  };

  return (
    <div className="group">
      <Link
        to="/user/dm/$conversationId"
        params={{ conversationId: conversation.id }}
        search={{ showArchived: false }}
        className="flex items-center gap-3 px-3 py-2 hover:bg-accent/50 rounded-md transition-colors"
        activeProps={{
          className: "bg-accent text-accent-foreground",
        }}
      >
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Link>
    </div>
  );
}

export { ConversationSidebarItem };
