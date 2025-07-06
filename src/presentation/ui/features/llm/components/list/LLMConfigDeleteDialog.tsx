import React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { LLMConfig } from "../LLMConfigList";

interface LLMConfigDeleteDialogProps {
  showDeleteConfirm: LLMConfig | null;
  setShowDeleteConfirm: (config: LLMConfig | null) => void;
  confirmDelete: () => void;
}

export function LLMConfigDeleteDialog({
  showDeleteConfirm,
  setShowDeleteConfirm,
  confirmDelete,
}: LLMConfigDeleteDialogProps) {
  return (
    <AlertDialog
      open={!!showDeleteConfirm}
      onOpenChange={(open) => !open && setShowDeleteConfirm(null)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a configuração LLM &quot;
            {showDeleteConfirm?.name}&quot;? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setShowDeleteConfirm(null)}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
