import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation, Link } from "@tanstack/react-router";
import {
  MessageCircle,
  Archive,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import { useState, useMemo } from "react";

import type { UserSummary } from "@/main/features/user/user.service";

import { CustomLink } from "@/renderer/components/custom-link";
import { Button } from "@/renderer/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Switch } from "@/renderer/components/ui/switch";
import { useAuth } from "@/renderer/contexts/auth.context";
import { getOtherParticipants, createConversationAvatar } from "@/renderer/features/conversation/utils/conversation-avatar.utils";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";
import { cn } from "@/renderer/lib/utils";

import { ArchiveConversationDialog } from "./archive-conversation-dialog";

import type { ConversationWithLastMessage } from "../types";

// Main ConversationList component
interface ConversationListProps {
  conversations: ConversationWithLastMessage[];
  availableUsers: UserSummary[];
}

export function ConversationList(props: ConversationListProps) {
  const { conversations, availableUsers } = props;
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Use local state for switch - no URL manipulation
  const [showArchived, setShowArchived] = useState(false);

  // Handle archive toggle with intelligent navigation - inline logic
  const handleToggleShowArchived = (checked: boolean) => {
    setShowArchived(checked);

    // Navigate away from archived conversation when turning off archived mode
    if (!checked && location.pathname.includes("/dm/")) {
      const currentConversationId = location.pathname.split("/dm/")[1];
      const currentConversation = conversations.find(
        (conv) => conv.id === currentConversationId,
      );

      if (currentConversation?.archivedAt) {
        const firstActiveConversation = conversations.find(
          (conv) => !conv.archivedAt,
        );

        navigate(
          firstActiveConversation
            ? {
                to: "/user/dm/$conversationId",
                params: { conversationId: firstActiveConversation.id },
              }
            : { to: "/user" },
        );
      }
    }
  };

  // Filter conversations based on archive status
  const displayConversations = useMemo(() => {
    const activeConversations = conversations.filter(
      (conv) => !conv.archivedAt,
    );
    const archivedConversations = conversations.filter(
      (conv) => conv.archivedAt,
    );

    return showArchived
      ? [...activeConversations, ...archivedConversations] // Show all when archived mode is on
      : activeConversations; // Show only active when archived mode is off
  }, [conversations, showArchived]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <MessageCircle className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-w-0 w-full overflow-hidden">
      <ConversationListHeader
        onCreateConversation={() => navigate({ to: "/user/dm/new" })}
        showArchived={showArchived}
        onToggleShowArchived={handleToggleShowArchived}
      />

      {displayConversations.length === 0 ? (
        <ConversationListEmpty showArchived={showArchived} />
      ) : (
        <ScrollArea className="flex-1">
          <div className="space-y-[var(--spacing-component-xs)] pt-[var(--spacing-component-xs)] min-h-0 overflow-hidden">
            {displayConversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                availableUsers={availableUsers}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Create Dialog */}
    </div>
  );
}

// Compound Components

interface ConversationListHeaderProps {
  onCreateConversation: () => void;
  showArchived: boolean;
  onToggleShowArchived: (checked: boolean) => void;
}

function ConversationListHeader(props: ConversationListHeaderProps) {
  const { onCreateConversation, showArchived, onToggleShowArchived } = props;

  return (
    <div className="pb-[var(--spacing-component-sm)] border-b border-sidebar-border/40">
      <div className="flex items-center justify-between mb-[var(--spacing-component-sm)]">
        <h2 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wide">
          Direct Messages
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "w-6 h-6 hover:bg-sidebar-accent/60 transition-colors rounded-sm",
            "focus-visible:ring-1 focus-visible:ring-sidebar-ring",
          )}
          onClick={onCreateConversation}
        >
          <Plus className="w-4 h-4" />
          <span className="sr-only">Create new conversation</span>
        </Button>
      </div>

      {/* Archive Toggle - More compact */}
      <div className="flex items-center justify-between text-xs bg-sidebar-accent/20 rounded-md p-[var(--spacing-component-sm)] hover:bg-sidebar-accent/30 transition-colors">
        <div className="flex items-center gap-[var(--spacing-component-sm)]">
          <Archive className="w-3.5 h-3.5 text-sidebar-foreground/60" />
          <span className="text-sidebar-foreground/80 font-medium">
            Show Archived
          </span>
        </div>
        <Switch
          checked={showArchived}
          onCheckedChange={onToggleShowArchived}
          className="data-[state=checked]:bg-primary scale-75"
          aria-label="Toggle archived conversations visibility"
        />
      </div>
    </div>
  );
}

interface ConversationListEmptyProps {
  showArchived: boolean;
}

function ConversationListEmpty(props: ConversationListEmptyProps) {
  const { showArchived } = props;

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-[var(--spacing-component-sm)] py-[var(--spacing-component-lg)]">
      <div className="w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center mb-4">
        <MessageCircle className="w-6 h-6 text-muted-foreground/60" />
      </div>
      <div className="space-y-[var(--spacing-component-sm)] max-w-xs">
        <h3 className="font-medium text-foreground text-sm">
          {showArchived ? "No Archived Conversations" : "No Direct Messages"}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {showArchived
            ? "You haven't archived any conversations yet."
            : "Start a conversation with someone to begin chatting."}
        </p>
        {!showArchived && (
          <CustomLink
            to="/user/dm/new"
            variant="outline"
            size="sm"
            className="mt-3 h-7 text-xs"
          >
            <Plus className="w-3 h-3 mr-1.5" />
            New Message
          </CustomLink>
        )}
      </div>
    </div>
  );
}

interface ConversationListItemProps {
  conversation: ConversationWithLastMessage;
  availableUsers?: UserSummary[];
}

function ConversationListItem(props: ConversationListItemProps) {
  const { conversation, availableUsers = [] } = props;
  const queryClient = useQueryClient();
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const { user } = useAuth();

  // Archive conversation mutation
  const archiveMutation = useApiMutation(
    () => window.api.dm.archive(conversation.id),
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

  // Inline logic for message preview with aggressive truncation
  const messagePreview = conversation.lastMessage
    ? conversation.lastMessage.content.length > 30
      ? `${conversation.lastMessage.content.substring(0, 30)}...`
      : conversation.lastMessage.content
    : "No messages yet";

  // Inline logic for time formatting - Discord style
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
    <div className="group relative w-full min-w-0 overflow-hidden">
      <Link
        to="/user/dm/$conversationId"
        params={{ conversationId: conversation.id }}
        className={cn(
          "flex items-center gap-[var(--spacing-component-sm)] px-[var(--spacing-component-sm)] py-[var(--spacing-component-xs)] rounded transition-all duration-150",
          "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sidebar-ring",
          "w-full min-w-0 overflow-hidden",
          conversation.archivedAt && "opacity-60",
          hasUnreadMessages && "bg-sidebar-accent/30",
        )}
        activeProps={{
          className: "bg-sidebar-accent/90 text-sidebar-accent-foreground",
        }}
      >
        {/* Avatar - smaller Discord style with space for overlapped groups */}
        <div className="relative flex-shrink-0">
          {createConversationAvatar(
            getOtherParticipants(conversation, user?.id || "", availableUsers),
            "sm"
          )}
        </div>

        {/* Content - more compact with enforced constraints */}
        <div className="flex-1 min-w-0 max-w-0 overflow-hidden">
          {/* Name and time in same line - enforced width constraints */}
          <div className="flex items-center w-full min-w-0">
            <span
              className={cn(
                "text-sm font-medium truncate flex-1 min-w-0 max-w-0",
                conversation.archivedAt && "line-through text-muted-foreground",
                hasUnreadMessages
                  ? "text-sidebar-foreground"
                  : "text-sidebar-foreground/80",
              )}
            >
              {conversationName}
            </span>
            {formattedTime && (
              <span
                className={cn(
                  "text-xs whitespace-nowrap flex-shrink-0 ml-2 max-w-12 overflow-hidden",
                  hasUnreadMessages
                    ? "text-primary font-medium"
                    : "text-muted-foreground/80",
                )}
              >
                {formattedTime}
              </span>
            )}
          </div>

          {/* Message preview - simplified classes, enforced truncation */}
          <div className="text-xs text-muted-foreground/70 leading-tight truncate min-w-0 max-w-full">
            {messagePreview}
          </div>
        </div>

        {/* Unread indicator and actions */}
        <div className="flex items-center gap-[var(--spacing-component-xs)] flex-shrink-0">
          {hasUnreadMessages && (
            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
          )}

          {/* Actions menu - smaller */}
          <div
            className={cn(
              "opacity-0 group-hover:opacity-100 transition-opacity",
            )}
            onClick={(e) => e.preventDefault()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 hover:bg-sidebar-accent/60"
                >
                  <MoreHorizontal className="h-3 w-3" />
                  <span className="sr-only">Conversation options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {!conversation.archivedAt ? (
                  <DropdownMenuItem
                    onClick={handleArchive}
                    className="text-xs py-[var(--spacing-component-sm)] px-[var(--spacing-component-sm)] cursor-pointer"
                  >
                    <Archive className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    Archive Conversation
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={handleUnarchive}
                    className="text-xs py-[var(--spacing-component-sm)] px-[var(--spacing-component-sm)] cursor-pointer"
                  >
                    <Archive className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    Unarchive Conversation
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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

// Standalone EmptyConversations component for other use cases
interface EmptyConversationsProps {
  className?: string;
}

export function EmptyConversations(props: EmptyConversationsProps) {
  const { className } = props;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center h-full text-center p-6",
        className,
      )}
    >
      <div className="w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center mb-4">
        <MessageCircle className="h-6 w-6 text-muted-foreground/60" />
      </div>
      <h3 className="font-medium text-foreground text-sm mb-2">
        No Conversations Yet
      </h3>
      <p className="text-xs text-muted-foreground mb-4 max-w-xs">
        Connect with other users or AI agents in private conversations. Select
        participants to begin chatting.
      </p>
      <CustomLink to="/user/dm/new" size="sm" className="h-7 text-xs">
        <MessageCircle className="h-3 w-3 mr-1.5" />
        Start Conversation
      </CustomLink>
    </div>
  );
}
