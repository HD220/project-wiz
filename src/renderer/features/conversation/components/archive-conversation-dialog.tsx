import { useRouter } from "@tanstack/react-router";
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
import type { ArchiveConversationInput } from "@/renderer/features/conversation/types";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";

interface ArchiveConversationDialogProps {
  conversationId: string;
  conversationName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ArchiveConversationDialog(props: ArchiveConversationDialogProps) {
  const { conversationId, conversationName, open, onOpenChange } = props;
  const router = useRouter();

  // Archive mutation with automatic error handling and route invalidation
  const archiveMutation = useApiMutation(
    (input: ArchiveConversationInput) =>
      window.api.conversations.archive(input),
    {
      successMessage: "Conversa arquivada com sucesso",
      onSuccess: () => {
        // Invalidate routes to refresh conversation lists
        router.invalidate();
        onOpenChange(false);
      },
    },
  );

  function handleArchive() {
    archiveMutation.mutate({
      conversationId,
    });
  }

  function handleCancel() {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-muted-foreground" />
            Arquivar Conversa
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja arquivar{" "}
            {conversationName ? (
              <span className="font-medium">"{conversationName}"</span>
            ) : (
              "esta conversa"
            )}
            ?
            <br />
            <span className="text-xs text-muted-foreground/80 mt-2 block">
              Conversas arquivadas ficam ocultas por padrão mas podem ser
              acessadas novamente.
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 mt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={archiveMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleArchive}
            disabled={archiveMutation.isPending}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {archiveMutation.isPending ? (
              <>
                <Archive className="h-4 w-4 mr-2 animate-pulse" />
                Arquivando...
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 mr-2" />
                Arquivar Conversa
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { ArchiveConversationDialog };
