import { Loader2 } from "lucide-react";

import { Button } from '@/components/ui/button'
import { DialogClose } from '@/components/ui/dialog'

interface AddAgentFormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

export function AddAgentFormActions({
  isSubmitting,
  onCancel,
}: AddAgentFormActionsProps) {
  return (
    <DialogFooter className="mt-6">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Criar Agente
      </Button>
    </DialogFooter>
  );
}
