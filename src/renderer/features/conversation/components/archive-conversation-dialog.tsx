import { Archive, AlertTriangle, ArrowRight } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/renderer/components/ui/dialog";
import { cn } from "@/renderer/lib/utils";

interface ArchiveConversationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  conversationName?: string;
  isLoading?: boolean;
}

export function ArchiveConversationDialog(
  props: ArchiveConversationDialogProps,
) {
  const {
    open,
    onClose,
    onConfirm,
    conversationName,
    isLoading = false,
  } = props;

  const handleConfirm = () => {
    onConfirm();
    // Don't auto-close - let the parent component handle success/error states
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-border/50 shadow-2xl">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center ring-2 ring-amber-200 dark:ring-amber-800/50">
              <Archive className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-left">
                Archive Conversation
              </DialogTitle>
            </div>
          </div>

          <DialogDescription className="text-left space-y-3">
            <p className="text-base leading-relaxed">
              Are you sure you want to archive{" "}
              {conversationName ? (
                <span className="font-semibold text-foreground">
                  "{conversationName}"
                </span>
              ) : (
                "this conversation"
              )}
              ?
            </p>

            <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>This conversation will be:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li>Moved to your archived conversations</li>
                    <li>Hidden from your main conversation list</li>
                    <li>Notifications will be disabled</li>
                  </ul>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              "min-w-[120px] bg-amber-600 hover:bg-amber-700 text-white",
              "shadow-md hover:shadow-lg transition-all duration-200",
            )}
          >
            {isLoading ? (
              <>
                <Archive className="h-4 w-4 mr-2 animate-pulse" />
                Archiving...
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 mr-2" />
                Archive
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
