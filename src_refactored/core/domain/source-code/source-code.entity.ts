import { z } from "zod";

import { AbstractEntity, EntityProps } from "@/core/common/base.entity";

import { EntityError } from "@/domain/common/errors";

import { ProjectId } from "../project/value-objects/project-id.vo";

import { RepositoryDocsPath } from "./value-objects/repository-docs-path.vo";
import { RepositoryId } from "./value-objects/repository-id.vo";
import { RepositoryPath } from "./value-objects/repository-path.vo";

export interface SourceCodeProps {
  id: RepositoryId;
  projectId: ProjectId;
  path: RepositoryPath;
  docsPath?: RepositoryDocsPath | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const SourceCodePropsSchema = z.object({
  id: z.custom<RepositoryId>((val) => val instanceof RepositoryId),
  projectId: z.custom<ProjectId>((val) => val instanceof ProjectId),
  path: z.custom<RepositoryPath>((val) => val instanceof RepositoryPath),
  docsPath: z.custom<RepositoryDocsPath | null | undefined>((val) => val === null || val === undefined || val instanceof RepositoryDocsPath).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

interface InternalSourceCodeProps extends EntityProps<RepositoryId> {
  projectId: ProjectId;
  path: RepositoryPath;
  docsPath?: RepositoryDocsPath | null;
  createdAt: Date;
  updatedAt: Date;
}

export class SourceCode extends AbstractEntity<RepositoryId, InternalSourceCodeProps> {
  private constructor(props: InternalSourceCodeProps) {
    super(props);
  }

  public static create(props: SourceCodeProps): SourceCode {
    const validationResult = SourceCodePropsSchema.safeParse(props);
    if (!validationResult.success) {
      throw new EntityError("Invalid SourceCode props.", {
        details: validationResult.error.flatten().fieldErrors,
      });
    }

    const now = new Date();
    const internalProps: InternalSourceCodeProps = {
      id: props.id || RepositoryId.generate(),
      projectId: props.projectId,
      path: props.path,
      docsPath: props.docsPath === undefined ? null : props.docsPath,
      createdAt: props.createdAt || now,
      updatedAt: props.updatedAt || now,
    };

    return new SourceCode(internalProps);
  }

  public get projectId(): ProjectId {
    return this.props.projectId;
  }

  public get path(): RepositoryPath {
    return this.props.path;
  }

  public get docsPath(): RepositoryDocsPath | null | undefined {
    return this.props.docsPath;
  }
}

