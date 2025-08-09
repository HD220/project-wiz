import { Link } from "@tanstack/react-router";
import { MessageCircle, Archive, Plus, MoreHorizontal } from "lucide-react";
import { useState } from "react";

import { CustomLink } from "@/renderer/components/custom-link";
import { Button } from "@/renderer/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";
import { Switch } from "@/renderer/components/ui/switch";
import { useAuth } from "@/renderer/contexts/auth.context";
import {
  getOtherParticipants,
  createConversationAvatar,
} from "@/renderer/features/conversation/utils/conversation-avatar.utils";
import { useArchiveConversation } from "@/renderer/features/conversation/hooks/use-archive-conversation.hook";
import { useUnarchiveConversation } from "@/renderer/features/conversation/hooks/use-unarchive-conversation.hook";
import { cn } from "@/renderer/lib/utils";

import type { DMConversation } from "@/shared/types/dm-conversation";
import type { Message } from "@/shared/types/message";
import type { User } from "@/shared/types/user";

import { ConfirmationDialog } from "@/renderer/components/ui/confirmation-dialog";

// Local type that reflects what dm.list() API actually returns
interface DMConversationWithLastMessage extends DMConversation {
  lastMessage?: Message;
  participants?: User[];
}

// Main ConversationList component
interface ConversationListProps {
  conversations: DMConversationWithLastMessage[];
  availableUsers: User[];
  showArchived: boolean;
  onToggleShowArchived: (checked: boolean) => void;
  onCreateConversation: () => void;
}

export function ConversationList(props: ConversationListProps) {
  const { conversations, availableUsers, showArchived, onToggleShowArchived, onCreateConversation } = props;
  const { user: currentUser } = useAuth();

  // No more filtering - conversations are already filtered by backend
  const displayConversations = conversations;

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
        onCreateConversation={onCreateConversation}
        showArchived={showArchived}
        onToggleShowArchived={onToggleShowArchived}
      />

      {displayConversations.length === 0 ? (
        <ConversationListEmpty showArchived={showArchived} />
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-[var(--spacing-component-xs)] pt-[var(--spacing-component-xs)]">
            {displayConversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                availableUsers={availableUsers}
              />
            ))}
          </div>
        </div>
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
  conversation: DMConversationWithLastMessage;
  availableUsers?: User[];
}

function ConversationListItem(props: ConversationListItemProps) {
  const { conversation } = props;
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showUnarchiveDialog, setShowUnarchiveDialog] = useState(false);
  const { user } = useAuth();

  // Use specific hooks for each action
  const archiveMutation = useArchiveConversation();
  const unarchiveMutation = useUnarchiveConversation();

  // Inline logic for display name - simplified
  const conversationName = conversation.name || "Unnamed Conversation";

  // Inline logic for message preview - let CSS handle ellipsis
  const messagePreview = conversation.lastMessage
    ? conversation.lastMessage.content
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

  // Action handlers - using specific mutations
  const handleArchive = () => setShowArchiveDialog(true);
  const handleUnarchive = () => setShowUnarchiveDialog(true);
  
  const handleConfirmArchive = () => {
    archiveMutation.mutate(conversation.id);
    setShowArchiveDialog(false);
  };
  
  const handleConfirmUnarchive = () => {
    unarchiveMutation.mutate(conversation.id);
    setShowUnarchiveDialog(false);
  };

  // Unread messages logic - placeholder for future implementation
  const hasUnreadMessages = conversation.lastMessage && false; // TODO: Implement proper unread logic

  return (
    <div className="group relative w-full min-w-0 overflow-hidden">
      <Link
        to="/user/dm/$conversationId"
        params={{ conversationId: conversation.id }}
        className={cn(
          "flex items-center gap-2 px-2 py-[var(--spacing-component-xs)] rounded transition-all duration-150",
          "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sidebar-ring",
          "w-full overflow-hidden",
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
            getOtherParticipants(
              conversation.participants || [],
              user?.id || "",
            ),
            "sm",
          )}
        </div>

        {/* Content - responsive grid layout */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {/* Name and time row - CSS Grid for optimal space distribution */}
          <div className="grid grid-cols-[1fr_auto] gap-2 items-center min-w-0">
            <h3
              className={cn(
                "text-sm font-medium truncate min-w-0",
                conversation.archivedAt && "line-through text-muted-foreground",
                hasUnreadMessages
                  ? "text-sidebar-foreground"
                  : "text-sidebar-foreground/80",
              )}
              title={conversationName}
            >
              {conversationName}
            </h3>
            {formattedTime && (
              <time
                className={cn(
                  "text-xs whitespace-nowrap",
                  hasUnreadMessages
                    ? "text-primary font-medium"
                    : "text-muted-foreground/80",
                )}
                dateTime={conversation.lastMessage?.createdAt?.toString()}
              >
                {formattedTime}
              </time>
            )}
          </div>

          {/* Message preview */}
          <p className="text-xs text-muted-foreground/70 leading-tight truncate min-w-0">
            {messagePreview}
          </p>
        </div>

        {/* Unread indicator and actions */}
        <div className="flex items-center gap-1 flex-shrink-0 w-5">
          {hasUnreadMessages && (
            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
          )}

          {/* Actions menu - minimal */}
          <div
            className={cn(
              "opacity-0 group-hover:opacity-100 transition-opacity w-4",
            )}
            onClick={(e) => e.preventDefault()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-sidebar-accent/60"
                >
                  <MoreHorizontal className="h-2.5 w-2.5" />
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
      <ConfirmationDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        onConfirm={handleConfirmArchive}
        title="Archive Conversation"
        description={`Are you sure you want to archive "${conversationName}"? This will move it to your archived conversations and disable notifications.`}
        confirmText="Archive"
        variant="warning"
        isLoading={archiveMutation.isPending}
      />

      {/* Unarchive confirmation dialog */}
      <ConfirmationDialog
        open={showUnarchiveDialog}
        onOpenChange={setShowUnarchiveDialog}
        onConfirm={handleConfirmUnarchive}
        title="Unarchive Conversation"
        description={`Are you sure you want to unarchive "${conversationName}"? This will move it back to your active conversations.`}
        confirmText="Unarchive"
        variant="default"
        isLoading={unarchiveMutation.isPending}
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
