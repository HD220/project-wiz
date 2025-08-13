import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { ConversationList } from "@/renderer/features/conversation/components/conversation-list";
import { useConversations } from "@/renderer/features/conversation/hooks/use-conversations.hook";
import { cn } from "@/renderer/lib/utils";

interface ConversationSectionProps {
  className?: string;
}

/**
 * Self-contained conversation section with its own state and data fetching
 * Eliminates prop drilling by managing showArchived state locally
 */
export function ConversationSection({ className }: ConversationSectionProps) {
  const navigate = useNavigate();
  const [showArchived, setShowArchived] = useState(false);

  const { conversations: allConversations, isLoading: conversationsLoading } =
    useConversations();

  // Load available users for combining with conversation data
  const { data: availableUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ["availableUsers"],
    queryFn: async () => {
      const response = await window.api.user.listAvailableUsers({});
      if (!response.success) {
        throw new Error(response.error || "Failed to load available users");
      }
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Filter conversations on frontend based on showArchived state
  const conversations = allConversations.filter((conversation) =>
    showArchived ? !!conversation.archivedAt : !conversation.archivedAt,
  );

  const isLoading = conversationsLoading || usersLoading;

  const handleToggleArchived = (checked: boolean) => {
    setShowArchived(checked);
  };

  const handleCreateConversation = () => {
    navigate({ to: "/user/dm/new" });
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center h-32", className)}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-0 w-full overflow-hidden", className)}>
      <ConversationList
        conversations={conversations}
        availableUsers={availableUsers}
        showArchived={showArchived}
        onToggleShowArchived={handleToggleArchived}
        onCreateConversation={handleCreateConversation}
      />
    </div>
  );
}
