import { Dialog, DialogContent } from "@/ui/dialog";

import { NewConversationAgentSelector } from "./new-conversation-agent-selector";
import { NewConversationModalHeader } from "./new-conversation-modal-header";

interface NewConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewConversationModal({
  open,
  onOpenChange,
}: NewConversationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <NewConversationModalHeader />
        <NewConversationAgentSelector />
      </DialogContent>
    </Dialog>
  );
}
