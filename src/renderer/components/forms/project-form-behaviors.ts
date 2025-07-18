import { useState } from "react";

// Value Objects for form state
class ProjectFormState {
  constructor(
    private readonly name: string,
    private readonly description: string,
    private readonly gitUrl: string,
    private readonly isSubmitting: boolean,
  ) {}

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  getGitUrl(): string {
    return this.gitUrl;
  }

  isSubmitDisabled(): boolean {
    return this.isSubmitting || this.name.trim() === "";
  }

  isFieldDisabled(): boolean {
    return this.isSubmitting;
  }

  withName(name: string): ProjectFormState {
    return new ProjectFormState(
      name,
      this.description,
      this.gitUrl,
      this.isSubmitting,
    );
  }

  withDescription(description: string): ProjectFormState {
    return new ProjectFormState(
      this.name,
      description,
      this.gitUrl,
      this.isSubmitting,
    );
  }

  withGitUrl(gitUrl: string): ProjectFormState {
    return new ProjectFormState(
      this.name,
      this.description,
      gitUrl,
      this.isSubmitting,
    );
  }

  withSubmitting(isSubmitting: boolean): ProjectFormState {
    return new ProjectFormState(
      this.name,
      this.description,
      this.gitUrl,
      isSubmitting,
    );
  }
}

// Form actions as behaviors
class ProjectFormActions {
  constructor(
    private readonly state: ProjectFormState,
    private readonly setState: (state: ProjectFormState) => void,
    private readonly onSubmit: (data: ProjectFormData) => Promise<void>,
  ) {}

  handleNameChange(value: string): void {
    this.setState(this.state.withName(value));
  }

  handleDescriptionChange(value: string): void {
    this.setState(this.state.withDescription(value));
  }

  handleGitUrlChange(value: string): void {
    this.setState(this.state.withGitUrl(value));
  }

  async handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();

    if (this.state.isSubmitDisabled()) {
      return;
    }

    this.setState(this.state.withSubmitting(true));

    try {
      await this.onSubmit({
        name: this.state.getName(),
        description: this.state.getDescription(),
        gitUrl: this.state.getGitUrl(),
      });
    } finally {
      this.setState(this.state.withSubmitting(false));
    }
  }

  handleCancel(): void {
    this.setState(new ProjectFormState("", "", "", false));
  }
}

// Data transfer object
export interface ProjectFormData {
  name: string;
  description: string;
  gitUrl: string;
}

// Hook with expressive behaviors
export function useProjectFormBehaviors(
  onSubmit: (data: ProjectFormData) => Promise<void>,
  onCancel?: () => void,
) {
  const [state, setState] = useState(new ProjectFormState("", "", "", false));

  const actions = new ProjectFormActions(state, setState, onSubmit);

  return {
    state,
    behaviors: {
      handleNameChange: (value: string) => actions.handleNameChange(value),
      handleDescriptionChange: (value: string) =>
        actions.handleDescriptionChange(value),
      handleGitUrlChange: (value: string) => actions.handleGitUrlChange(value),
      handleSubmit: (event: React.FormEvent) => actions.handleSubmit(event),
      handleCancel: () => {
        actions.handleCancel();
        onCancel?.();
      },
    },
  };
}
