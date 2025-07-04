import { z } from "zod";

import { AbstractEntity, EntityProps } from "@/core/common/base.entity";

import { EntityError } from "@/domain/common/errors";

import { ProjectDescription } from "./value-objects/project-description.vo";
import { ProjectId } from "./value-objects/project-id.vo";
import { ProjectName } from "./value-objects/project-name.vo";

export interface ProjectProps {
  id: ProjectId;
  name: ProjectName;
  description?: ProjectDescription | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProjectPropsSchema = z.object({
  id: z.custom<ProjectId>((val) => val instanceof ProjectId),
  name: z.custom<ProjectName>((val) => val instanceof ProjectName),
  description: z.custom<ProjectDescription | null | undefined>((val) => val === null || val === undefined || val instanceof ProjectDescription).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

interface InternalProjectProps extends EntityProps<ProjectId> {
  name: ProjectName;
  description?: ProjectDescription | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Project extends AbstractEntity<ProjectId, InternalProjectProps> {
  private constructor(props: InternalProjectProps) {
    super(props);
  }

  public static create(props: ProjectProps): Project {
    const validationResult = ProjectPropsSchema.safeParse(props);
    if (!validationResult.success) {
      const errorMessages = Object.values(validationResult.error.flatten().fieldErrors).flat().join('; ');
      throw new EntityError(`Invalid Project props: ${errorMessages}`, {
        details: validationResult.error.flatten().fieldErrors,
      });
    }

    const now = new Date();
    const internalProps: InternalProjectProps = {
      id: props.id || ProjectId.generate(),
      name: props.name,
      description: props.description === undefined ? null : props.description,
      createdAt: props.createdAt || now,
      updatedAt: props.updatedAt || now,
    };

    return new Project(internalProps);
  }

  public get name(): ProjectName {
    return this.props.name;
  }

  public get description(): ProjectDescription | null | undefined {
    return this.props.description;
  }

  public changeName(newName: ProjectName): Project {
    const newProps = { ...this.props, name: newName, updatedAt: new Date() };
    return new Project(newProps);
  }

  public changeDescription(newDescription: ProjectDescription): Project {
    const newProps = { ...this.props, description: newDescription, updatedAt: new Date() };
    return new Project(newProps);
  }
}
