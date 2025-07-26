import { useNavigate, useSearch, useRouter } from "@tanstack/react-router";
import { MessageCircle, Archive, Plus } from "lucide-react";
import { useState } from "react";

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

  // Get showArchived state from URL parameter instead of local state
  const search = useSearch({ from: "/_authenticated/user" });
  const showArchived = search.showArchived || false;

  // Navigate to update URL parameter when toggling
  const navigate = useNavigate();

  // Local state for UI only
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Toggle archive filter by updating URL parameter
  function toggleShowArchived() {
    navigate({
      to: "/user",
      search: { showArchived: !showArchived },
    });
  }

  // Filter conversations based on archive status
  const activeConversations = conversations.filter((conv) => !conv.archivedAt);
  const archivedConversations = conversations.filter((conv) => conv.archivedAt);

  const displayConversations = showArchived
    ? archivedConversations
    : activeConversations;

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
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Direct Messages</h2>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Archive Toggle */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Show Archived</span>
          </div>
          <Switch checked={showArchived} onCheckedChange={toggleShowArchived} />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {displayConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <MessageCircle className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">
                {showArchived
                  ? "No Archived Conversations"
                  : "No Direct Messages"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-48">
                {showArchived
                  ? "You haven't archived any conversations yet."
                  : "Start a conversation with someone to begin chatting."}
              </p>
              {!showArchived && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateDialog(true)}
                  className="mt-3"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Message
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="py-2">
            {displayConversations.map((conversation) => (
              <ConversationSidebarItem
                key={conversation.id}
                conversation={conversation}
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
            // Navigate to the new conversation and invalidate to refresh data
            router.navigate({
              to: "/user/dm/$conversationId",
              params: { conversationId },
            });
            router.invalidate();
          }}
        />
      )}
    </div>
  );
}

export { ConversationSidebarList };
