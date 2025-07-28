import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/renderer/components/ui/alert-dialog";
import { StatusIndicator } from "@/renderer/components/ui/status-indicator";
import type { SelectAgent } from "@/renderer/features/agent/agent.types";
import { cn } from "@/renderer/lib/utils";

interface AgentDeleteDialogProps {
  agent: SelectAgent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function AgentDeleteDialog(props: AgentDeleteDialogProps) {
  const { agent, open, onOpenChange, onConfirm, isLoading } = props;

  if (!agent) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card/95 backdrop-blur-sm border border-border/60 shadow-xl max-w-md">
        {/* Enhanced Header with Icon */}
        <AlertDialogHeader className="space-y-[var(--spacing-component-md)]">
          <div className="flex items-center gap-[var(--spacing-component-md)]">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/10 flex items-center justify-center border border-destructive/20">
              <span className="text-destructive text-xl">⚠️</span>
            </div>
            <div className="space-y-[var(--spacing-component-xs)]">
              <AlertDialogTitle className="text-xl font-bold text-foreground">
                Delete Agent
              </AlertDialogTitle>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone
              </p>
            </div>
          </div>

          {/* Enhanced Description */}
          <div className="space-y-[var(--spacing-component-sm)] p-4 rounded-lg bg-destructive/5 border border-destructive/20">
            <AlertDialogDescription className="text-sm leading-relaxed text-foreground">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-destructive">
                {agent.name}
              </span>
              ?
            </AlertDialogDescription>

            <div className="space-y-[var(--spacing-component-sm)]">
              <p className="text-xs text-muted-foreground">
                The following will be permanently deleted:
              </p>
              <ul className="text-xs text-muted-foreground space-y-[var(--spacing-component-xs)] ml-4">
                <li className="flex items-center gap-[var(--spacing-component-sm)]">
                  <StatusIndicator
                    status="error"
                    size="sm"
                    variant="dot"
                    className="w-1 h-1"
                  />
                  Agent configuration and settings
                </li>
                <li className="flex items-center gap-[var(--spacing-component-sm)]">
                  <StatusIndicator
                    status="error"
                    size="sm"
                    variant="dot"
                    className="w-1 h-1"
                  />
                  All conversations and chat history
                </li>
                <li className="flex items-center gap-[var(--spacing-component-sm)]">
                  <StatusIndicator
                    status="error"
                    size="sm"
                    variant="dot"
                    className="w-1 h-1"
                  />
                  Stored memories and context
                </li>
              </ul>
            </div>
          </div>
        </AlertDialogHeader>

        {/* Enhanced Footer */}
        <AlertDialogFooter className="gap-[var(--spacing-component-sm)] pt-[var(--spacing-component-lg)]">
          <AlertDialogCancel
            disabled={isLoading}
            className="h-11 px-6 border-border/60 hover:bg-accent/50 transition-all duration-200"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "h-11 px-6 min-w-[120px]",
              "bg-destructive text-destructive-foreground",
              "hover:bg-destructive/90 focus:bg-destructive/90",
              "shadow-lg shadow-destructive/20",
              "transition-all duration-200",
              isLoading && "opacity-50 cursor-not-allowed",
            )}
          >
            {isLoading ? (
              <div className="flex items-center gap-[var(--spacing-component-sm)]">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Deleting...</span>
              </div>
            ) : (
              "Delete Agent"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
