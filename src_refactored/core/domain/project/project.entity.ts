// src_refactored/core/domain/project/project.entity.ts
import { AbstractEntity, EntityProps } from '@/core/common/base.entity';
import { EntityError } from '@/domain/common/errors';

import { ProjectDescription } from './value-objects/project-description.vo';
import { ProjectId } from './value-objects/project-id.vo';
import { ProjectName } from './value-objects/project-name.vo';

interface ProjectConstructorProps { // Renamed to avoid conflict with internal props type name
  id?: ProjectId; // Optional at creation, will be generated if not provided
  name: ProjectName;
  description: ProjectDescription;
  createdAt?: Date;
  updatedAt?: Date;
}

// Properties managed by AbstractEntity + Project specific VOs
interface InternalProjectProps extends EntityProps<ProjectId> {
  name: ProjectName;
  description: ProjectDescription;
}

export class Project extends AbstractEntity<ProjectId, InternalProjectProps> {

  private constructor(props: InternalProjectProps) {
    super(props);
  }

  public static create(props: ProjectConstructorProps): Project {
    if (!props.name) throw new EntityError('Project name is required.');
    if (!props.description) throw new EntityError('Project description is required.');

    const now = new Date();
    const projectId = props.id || ProjectId.generate();

    const internalProps: InternalProjectProps = {
      id: projectId,
      name: props.name,
      description: props.description,
      createdAt: props.createdAt || now,
      updatedAt: props.updatedAt || now,
    };

    return new Project(internalProps);
  }

  // id(), createdAt(), updatedAt() are inherited from AbstractEntity

  public name(): ProjectName {
    return this.props.name;
  }

  public description(): ProjectDescription {
    return this.props.description;
  }

  // Behavior methods return new instances
  public changeName(newName: ProjectName): Project {
    if (!newName) throw new EntityError('New name cannot be null or undefined for Project.');
    return new Project({
      ...this.props, // Spreads id, name, description, createdAt
      name: newName,
      updatedAt: new Date(), // Explicitly set updatedAt
    });
  }

  public changeDescription(newDescription: ProjectDescription): Project {
    if (!newDescription) throw new EntityError('New description cannot be null or undefined for Project.');
    return new Project({
      ...this.props, // Spreads id, name, description, createdAt
      description: newDescription,
      updatedAt: new Date(), // Explicitly set updatedAt
    });
  }

  // equals() is inherited from AbstractEntity
}
