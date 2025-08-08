import { Archive, Plus } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import { Switch } from "@/renderer/components/ui/switch";
import { cn } from "@/renderer/lib/utils";

interface ConversationHeaderProps {
  showArchived: boolean;
  onToggleArchived: (checked: boolean) => void;
  onCreateConversation: () => void;
}

/**
 * Header component for conversation section
 * Pure component that handles archive toggle and create button
 */
export function ConversationHeader({
  showArchived,
  onToggleArchived,
  onCreateConversation,
}: ConversationHeaderProps) {
  return (
    <div className="pb-[var(--spacing-component-sm)] border-b border-sidebar-border/40">
      {/* Section title and create button */}
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
          aria-label="Create new conversation"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Archive toggle */}
      <div className="flex items-center justify-between text-xs bg-sidebar-accent/20 rounded-md p-[var(--spacing-component-sm)] hover:bg-sidebar-accent/30 transition-colors">
        <div className="flex items-center gap-[var(--spacing-component-sm)]">
          <Archive className="w-3.5 h-3.5 text-sidebar-foreground/60" />
          <span className="text-sidebar-foreground/80 font-medium">
            Show Archived
          </span>
        </div>
        
        <Switch
          checked={showArchived}
          onCheckedChange={onToggleArchived}
          className="data-[state=checked]:bg-primary scale-75"
          aria-label="Toggle archived conversations visibility"
        />
      </div>
    </div>
  );
}