import { Button } from "@/components/ui/button";

interface ProjectFormActionsProps {
  name: string;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function ProjectFormActions({
  name,
  isSubmitting,
  onCancel,
}: ProjectFormActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      <Button type="submit" disabled={!name.trim() || isSubmitting}>
        {isSubmitting ? "Criando..." : "Criar Projeto"}
      </Button>
    </div>
  );
}
