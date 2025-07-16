import { User } from "lucide-react";

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export function AddAgentModalHeader() {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <User className="w-5 h-5" />
        Adicionar Agente ao Projeto
      </DialogTitle>
      <DialogDescription>
        Configure um novo agente para este projeto. Preencha as informações
        básicas e avançadas.
      </DialogDescription>
    </DialogHeader>
  );
}
