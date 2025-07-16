import { Button } from "@/components/ui/button";

interface ProjectFormSubmitButtonProps {
  isLoading: boolean;
}

export function ProjectFormSubmitButton({
  isLoading,
}: ProjectFormSubmitButtonProps) {
  return (
    <Button type="submit" disabled={isLoading} className="w-full">
      {isLoading ? "Criando..." : "Criar Projeto"}
    </Button>
  );
}
