import { MessageCircle, Plus } from "lucide-react";

import { CustomLink } from "@/renderer/components/custom-link";
import { cn } from "@/renderer/lib/utils";

interface ConversationEmptyStateProps {
  showArchived: boolean;
  className?: string;
}

/**
 * Empty state component for conversation lists
 * Pure presentational component with different states for archived/active views
 */
export function ConversationEmptyState({ 
  showArchived, 
  className 
}: ConversationEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center h-full text-center px-[var(--spacing-component-sm)] py-[var(--spacing-component-lg)]",
        className,
      )}
    >
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