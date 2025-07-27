import { useNavigate, useLocation, Link } from "@tanstack/react-router";
import { MessageCircle, Archive, Plus, MoreHorizontal } from "lucide-react";
import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { UserSummary } from "@/main/features/user/user.service";

import { Button } from "@/renderer/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";
import { Switch } from "@/renderer/components/ui/switch";
import { cn } from "@/renderer/lib/utils";
import { useAuth } from "@/renderer/contexts/auth.context";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";

import { ArchiveConversationDialog } from "./archive-conversation-dialog";
import { ConversationAvatar } from "./conversation-avatar";
import { CreateConversationDialog } from "./create-conversation-dialog";

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
  const [showCreateDialog, setShowCreateDialog] = useState(false);

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
    <div className="flex flex-col h-full">
      <ConversationListHeader
        onCreateConversation={() => setShowCreateDialog(true)}
        showArchived={showArchived}
        onToggleShowArchived={handleToggleShowArchived}
      />

      {displayConversations.length === 0 ? (
        <ConversationListEmpty
          showArchived={showArchived}
          onCreateConversation={() => setShowCreateDialog(true)}
        />
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-thin py-2 space-y-1">
          {displayConversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              availableUsers={availableUsers}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      {showCreateDialog && (
        <CreateConversationDialog
          availableUsers={availableUsers}
          currentUser={currentUser}
          onClose={() => setShowCreateDialog(false)}
          onConversationCreated={(conversationId) => {
            setShowCreateDialog(false);
            // Navigate to the new conversation
            // Don't call router.invalidate() here - useApiMutation already handles it
            navigate({
              to: "/user/dm/$conversationId",
              params: { conversationId },
            });
          }}
        />
      )}
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
    <div className="p-4 border-b border-border/50 bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground text-base tracking-tight">
          Direct Messages
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "w-8 h-8 hover:bg-accent/80 transition-colors rounded-md",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          )}
          onClick={onCreateConversation}
        >
          <Plus className="w-4 h-4" />
          <span className="sr-only">Create new conversation</span>
        </Button>
      </div>

      {/* Archive Toggle */}
      <div className="flex items-center justify-between text-sm bg-muted/30 rounded-lg p-2.5 hover:bg-muted/40 transition-colors">
        <div className="flex items-center gap-2.5">
          <Archive className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground font-medium">
            Show Archived
          </span>
        </div>
        <Switch
          checked={showArchived}
          onCheckedChange={onToggleShowArchived}
          className="data-[state=checked]:bg-primary"
          aria-label="Toggle archived conversations visibility"
        />
      </div>
    </div>
  );
}

interface ConversationListEmptyProps {
  showArchived: boolean;
  onCreateConversation: () => void;
}

function ConversationListEmpty(props: ConversationListEmptyProps) {
  const { showArchived, onCreateConversation } = props;

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-6">
        <MessageCircle className="w-8 h-8 text-muted-foreground/60" />
      </div>
      <div className="space-y-4 max-w-xs">
        <h3 className="font-semibold text-foreground text-base">
          {showArchived ? "No Archived Conversations" : "No Direct Messages"}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {showArchived
            ? "You haven't archived any conversations yet."
            : "Start a conversation with someone to begin chatting."}
        </p>
        {!showArchived && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateConversation}
            className={cn(
              "mt-2 shadow-sm hover:shadow-md transition-all duration-200",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Message
          </Button>
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
    <div className="group relative conversation-item-enter px-2">
      <Link
        to="/user/dm/$conversationId"
        params={{ conversationId: conversation.id }}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
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

// Standalone EmptyConversations component for other use cases
interface EmptyConversationsProps {
  onCreateConversation: () => void;
  className?: string;
}

export function EmptyConversations(props: EmptyConversationsProps) {
  const { onCreateConversation, className } = props;

  return (
    <Card
      className={`border-dashed border-2 border-muted-foreground/25 ${className || ""}`}
    >
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <MessageCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl">No Conversations Yet</CardTitle>
        <CardDescription className="text-base">
          Start your first direct message conversation
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center pt-0">
        <p className="text-sm text-muted-foreground mb-6">
          Connect with other users or AI agents in private conversations. Select
          participants to begin chatting.
        </p>
        <Button onClick={onCreateConversation} className="gap-2">
          <MessageCircle className="h-4 w-4" />
          Start Conversation
        </Button>
      </CardContent>
    </Card>
  );
}
