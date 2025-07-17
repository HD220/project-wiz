import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  useProjectFormBehaviors,
  ProjectFormData,
} from "./project-form-behaviors";

interface ProjectFormExpressiveProps {
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel?: () => void;
}

export function ProjectFormExpressive({
  onSubmit,
  onCancel,
}: ProjectFormExpressiveProps) {
  const { state, behaviors } = useProjectFormBehaviors(onSubmit, onCancel);

  return (
    <form onSubmit={behaviors.handleSubmit} className="space-y-4">
      <ProjectNameField
        value={state.getName()}
        onChange={behaviors.handleNameChange}
        isDisabled={state.isFieldDisabled()}
      />

      <ProjectDescriptionField
        value={state.getDescription()}
        onChange={behaviors.handleDescriptionChange}
        isDisabled={state.isFieldDisabled()}
      />

      <ProjectGitUrlField
        value={state.getGitUrl()}
        onChange={behaviors.handleGitUrlChange}
        isDisabled={state.isFieldDisabled()}
      />

      <ProjectFormButtons
        isSubmitDisabled={state.isSubmitDisabled()}
        onCancel={behaviors.handleCancel}
      />
    </form>
  );
}

// Individual field components with single responsibility
function ProjectNameField({
  value,
  onChange,
  isDisabled,
}: {
  value: string;
  onChange: (value: string) => void;
  isDisabled: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="name">Nome do Projeto</Label>
      <Input
        id="name"
        placeholder="Nome do seu projeto"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={isDisabled}
      />
    </div>
  );
}

function ProjectDescriptionField({
  value,
  onChange,
  isDisabled,
}: {
  value: string;
  onChange: (value: string) => void;
  isDisabled: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="description">Descrição (Opcional)</Label>
      <Textarea
        id="description"
        placeholder="Uma breve descrição do projeto"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={isDisabled}
      />
    </div>
  );
}

function ProjectGitUrlField({
  value,
  onChange,
  isDisabled,
}: {
  value: string;
  onChange: (value: string) => void;
  isDisabled: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="gitUrl">URL do Repositório Git (Opcional)</Label>
      <Input
        id="gitUrl"
        placeholder="https://github.com/user/repo.git"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={isDisabled}
      />
    </div>
  );
}

function ProjectFormButtons({
  isSubmitDisabled,
  onCancel,
}: {
  isSubmitDisabled: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex justify-end space-x-2">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isSubmitDisabled}>
        Criar Projeto
      </Button>
    </div>
  );
}
