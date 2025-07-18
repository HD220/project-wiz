import { Hash } from "lucide-react";

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CreateChannelModalHeader() {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Hash className="w-5 h-5" />
        Criar Novo Canal
      </DialogTitle>
      <DialogDescription>
        Adicione um novo canal ao seu projeto para organizar conversas e
        atividades.
      </DialogDescription>
    </DialogHeader>
  );
}
