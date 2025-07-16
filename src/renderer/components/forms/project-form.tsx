import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProjectFormProps {
  name: string;
  description: string;
  gitUrl: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onGitUrlChange: (value: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
}

export function ProjectForm({
  name,
  description,
  gitUrl,
  onNameChange,
  onDescriptionChange,
  onGitUrlChange,
  isSubmitting,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nome do Projeto</Label>
        <Input
          id="name"
          placeholder="Nome do seu projeto"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Descrição (Opcional)</Label>
        <Textarea
          id="description"
          placeholder="Uma breve descrição do projeto"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="gitUrl">URL do Repositório Git (Opcional)</Label>
        <Input
          id="gitUrl"
          placeholder="https://github.com/user/repo.git"
          value={gitUrl}
          onChange={(e) => onGitUrlChange(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

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
    </form>
  );
}
