import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface CreateChannelModalFooterProps {
  channelName: string;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function CreateChannelModalFooter({
  channelName,
  isSubmitting,
  onCancel,
}: CreateChannelModalFooterProps) {
  return (
    <DialogFooter>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      <Button type="submit" disabled={!channelName.trim() || isSubmitting}>
        {isSubmitting ? "Criando..." : "Criar Canal"}
      </Button>
    </DialogFooter>
  );
}
