import { Archive } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/renderer/components/ui/dialog";

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
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Archive Conversation
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to archive{" "}
            {conversationName ? `"${conversationName}"` : "this conversation"}?
            It will be moved to your archived conversations and you won't
            receive notifications for it.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Archiving..." : "Archive"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
