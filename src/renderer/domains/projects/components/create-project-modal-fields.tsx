import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateProjectModalFieldsProps {
  name: string;
  description: string;
  gitUrl: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onGitUrlChange: (value: string) => void;
}

export function CreateProjectModalFields({
  name,
  description,
  gitUrl,
  onNameChange,
  onDescriptionChange,
  onGitUrlChange,
}: CreateProjectModalFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Projeto</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Digite o nome do projeto"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Descreva o projeto"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gitUrl">URL do Git (opcional)</Label>
        <Input
          id="gitUrl"
          value={gitUrl}
          onChange={(e) => onGitUrlChange(e.target.value)}
          placeholder="https://github.com/usuario/projeto"
          type="url"
        />
      </div>
    </>
  );
}
