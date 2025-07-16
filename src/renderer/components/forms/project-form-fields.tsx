import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProjectFormFieldsProps {
  name: string;
  description: string;
  gitUrl: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onGitUrlChange: (value: string) => void;
  isSubmitting: boolean;
}

export function ProjectFormFields({
  name,
  description,
  gitUrl,
  onNameChange,
  onDescriptionChange,
  onGitUrlChange,
  isSubmitting,
}: ProjectFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nome do Projeto</Label>
        <Input
          id="name"
          placeholder="Nome do seu projeto"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          disabled={isSubmitting}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Descrição (Opcional)</Label>
        <Textarea
          id="description"
          placeholder="Uma breve descrição do projeto"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          disabled={isSubmitting}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="gitUrl">URL do Repositório Git (Opcional)</Label>
        <Input
          id="gitUrl"
          placeholder="https://github.com/user/repo.git"
          value={gitUrl}
          onChange={(event) => onGitUrlChange(event.target.value)}
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
}
