import { useNavigate, useSearch } from "@tanstack/react-router";
import { MessageCircle, Archive, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/renderer/components/ui/button";
import { Switch } from "@/renderer/components/ui/switch";
import { useAuth } from "@/renderer/contexts/auth.context";
import { ConversationSidebarItem } from "@/renderer/features/conversation/components/conversation-sidebar-item";
import { CreateConversationDialog } from "@/renderer/features/conversation/components/create-conversation-dialog";
import type { ConversationWithLastMessage } from "@/renderer/features/conversation/types";

interface ConversationSidebarListProps {
  conversations: ConversationWithLastMessage[];
  availableUsers: Array<{
    id: string;
    name: string | null;
    username?: string;
    avatar?: string | null;
  }>;
}

function ConversationSidebarList(props: ConversationSidebarListProps) {
  const { conversations, availableUsers } = props;
  const { user: currentUser } = useAuth();
  const navigate = useNavigate({ from: "/_authenticated/user" });

  // Get current search params for showArchived toggle
  const search = useSearch({
    from: "/_authenticated/user",
    select: (search: any) => ({ showArchived: search?.showArchived || false }),
  });

  // SIMPLE: Local state for UI
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Toggle archive filter
  function toggleShowArchived() {
    navigate({
      search: { showArchived: !search.showArchived },
    });
  }

  // Filter conversations based on archive status
  const activeConversations = conversations.filter((conv) => !conv.archivedAt);
  const archivedConversations = conversations.filter((conv) => conv.archivedAt);

  const displayConversations = search.showArchived
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
          <Switch
            checked={search.showArchived}
            onCheckedChange={toggleShowArchived}
            size="sm"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {displayConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <MessageCircle className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">
                {search.showArchived
                  ? "No Archived Conversations"
                  : "No Direct Messages"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-48">
                {search.showArchived
                  ? "You haven't archived any conversations yet."
                  : "Start a conversation with someone to begin chatting."}
              </p>
              {!search.showArchived && (
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
                currentUser={currentUser}
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
          onClose={() => setShowCreateDialog(false)}
        />
      )}
    </div>
  );
}

export { ConversationSidebarList };
