import { useNavigate, useRouter, useLocation } from "@tanstack/react-router";
import { MessageCircle, Archive, Plus } from "lucide-react";
import { useState, useMemo } from "react";

import type { UserSummary } from "@/main/features/user/user.service";

import { Button } from "@/renderer/components/ui/button";
import { Switch } from "@/renderer/components/ui/switch";
import { useAuth } from "@/renderer/contexts/auth.context";
import { ConversationSidebarItem } from "@/renderer/features/conversation/components/conversation-sidebar-item";
import { CreateConversationDialog } from "@/renderer/features/conversation/components/create-conversation-dialog";
import type { ConversationWithLastMessage } from "@/renderer/features/conversation/types";

interface ConversationSidebarListProps {
  conversations: ConversationWithLastMessage[];
  availableUsers: UserSummary[];
}

function ConversationSidebarList(props: ConversationSidebarListProps) {
  const { conversations, availableUsers } = props;
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const navigate = useNavigate();
  const location = useLocation();

  // Use local state for switch - no URL manipulation
  const [showArchived, setShowArchived] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Handle intelligent navigation when turning off archived mode in archived conversation
  const handleToggleShowArchived = (checked: boolean) => {
    setShowArchived(checked);

    // If turning off archived mode and currently in an archived conversation
    if (!checked && location.pathname.includes("/dm/")) {
      const currentConversationId = location.pathname.split("/dm/")[1];
      const currentConversation = conversations.find(
        (conv) => conv.id === currentConversationId,
      );

      if (currentConversation?.archivedAt) {
        // Find first active conversation or go to dashboard
        const firstActiveConversation = conversations.find(
          (conv) => !conv.archivedAt,
        );

        if (firstActiveConversation) {
          navigate({
            to: "/user/dm/$conversationId",
            params: { conversationId: firstActiveConversation.id },
          });
        } else {
          navigate({ to: "/user" });
        }
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
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground text-base tracking-tight">
            Direct Messages
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 hover:bg-accent/80 transition-colors"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Archive Toggle */}
        <div className="flex items-center justify-between text-sm bg-muted/30 rounded-lg p-2 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground font-medium">
              Show Archived
            </span>
          </div>
          <Switch
            checked={showArchived}
            onCheckedChange={handleToggleShowArchived}
            disabled={false}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {displayConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-muted-foreground/60" />
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">
                {showArchived
                  ? "No Archived Conversations"
                  : "No Direct Messages"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-48 leading-relaxed">
                {showArchived
                  ? "You haven't archived any conversations yet."
                  : "Start a conversation with someone to begin chatting."}
              </p>
              {!showArchived && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateDialog(true)}
                  className="mt-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Message
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="py-1 space-y-0.5">
            {displayConversations.map((conversation, index) => (
              <ConversationSidebarItem
                key={conversation.id}
                conversation={conversation}
                availableUsers={availableUsers}
              />
            ))}
          </div>
        )}
      </div>

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

export { ConversationSidebarList };
