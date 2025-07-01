// src_refactored/core/domain/project/project.entity.ts
import { AbstractEntity, EntityProps } from "@/core/common/base.entity";

import { EntityError } from "@/domain/common/errors";

import { ProjectDescription } from "./value-objects/project-description.vo";
import { ProjectId } from "./value-objects/project-id.vo";
import { ProjectName } from "./value-objects/project-name.vo";

interface ProjectConstructorProps {
  id?: ProjectId;
  name: ProjectName;
  description: ProjectDescription;
  createdAt?: Date;
  updatedAt?: Date;
}

interface InternalProjectProps extends EntityProps<ProjectId> {
  name: ProjectName;
  description: ProjectDescription;
}

export class Project extends AbstractEntity<ProjectId, InternalProjectProps> {
  private constructor(props: InternalProjectProps) {
    super(props);
  }

  public static create(props: ProjectConstructorProps): Project {
    if (!props.name) throw new EntityError("Project name is required.");
    if (!props.description)
      throw new EntityError("Project description is required.");

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

  public name(): ProjectName {
    return this.props.name;
  }

  public description(): ProjectDescription {
    return this.props.description;
  }

  public changeName(newName: ProjectName): Project {
    if (!newName)
      throw new EntityError(
        "New name cannot be null or undefined for Project."
      );
    return new Project({
      ...this.props,
      name: newName,
      updatedAt: new Date(),
    });
  }

  public changeDescription(newDescription: ProjectDescription): Project {
    if (!newDescription)
      throw new EntityError(
        "New description cannot be null or undefined for Project."
      );
    return new Project({
      ...this.props,
      description: newDescription,
      updatedAt: new Date(),
    });
  }
}
