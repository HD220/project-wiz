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
  
  const { conversations: allConversations, isLoading } = useConversations();
  
  // Filter conversations on frontend based on showArchived state
  const conversations = allConversations.filter(conversation => 
    showArchived ? !!conversation.archivedAt : !conversation.archivedAt
  );

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
        availableUsers={[]} // Not needed anymore, keeping for backward compatibility
        showArchived={showArchived}
        onToggleShowArchived={handleToggleArchived}
        onCreateConversation={handleCreateConversation}
      />
    </div>
  );
}