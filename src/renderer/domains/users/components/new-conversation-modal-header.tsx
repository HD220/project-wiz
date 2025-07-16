import { MessageSquare } from "lucide-react";

import { DialogHeader, DialogTitle } from "@/ui/dialog";

export function NewConversationModalHeader() {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Nova Conversa
      </DialogTitle>
      <DialogDescription>
        Selecione um agente para iniciar uma nova conversa direta.
      </DialogDescription>
    </DialogHeader>
  );
}
