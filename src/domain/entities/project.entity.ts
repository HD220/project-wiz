// src/domain/entities/project.entity.ts
import { randomUUID } from 'crypto';

export interface ProjectProps {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  // Add other project-specific properties here, e.g.:
  // projectPath?: string;
  // lastAccessedAt?: Date;
}

export class Project {
  public readonly props: ProjectProps;

  private constructor(props: ProjectProps) {
    this.props = props;
  }

  public static create(params: {
    id?: string;
    name: string;
    description?: string;
  }): Project {
    const now = new Date();
    const id = params.id || `project-${randomUUID()}`;

    if (!params.name || params.name.trim().length === 0) {
      throw new Error('Project name cannot be empty.');
    }

    return new Project({
      id,
      name: params.name,
      description: params.description,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Getters
  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get description(): string | undefined { return this.props.description; }

  // Example update method (immutable pattern)
  public updateDetails(params: {
    name?: string;
    description?: string;
  }): Project {
    return new Project({
      ...this.props,
      name: params.name ?? this.props.name,
      description: params.description ?? this.props.description,
      updatedAt: new Date(),
    });
  }
}
