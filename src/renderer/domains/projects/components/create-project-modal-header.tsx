import { Folder } from "lucide-react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function CreateProjectModalHeader() {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Folder className="w-5 h-5" />
        Criar Novo Projeto
      </DialogTitle>
      <DialogDescription>
        Configure um novo projeto para começar a trabalhar.
      </DialogDescription>
    </DialogHeader>
  );
}