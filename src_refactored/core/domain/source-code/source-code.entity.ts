// src_refactored/core/domain/source-code/source-code.entity.ts
import { ProjectId } from '../project/value-objects/project-id.vo';

import { RepositoryDocsPath } from './value-objects/repository-docs-path.vo';
import { RepositoryId } from './value-objects/repository-id.vo';
import { RepositoryPath } from './value-objects/repository-path.vo';

interface SourceCodeProps {
  id: RepositoryId;
  projectId: ProjectId;
  path: RepositoryPath;
  docsPath?: RepositoryDocsPath; // Optional, as per CreateProjectUseCase logic
  // createdAt: Date;
  // updatedAt: Date;
}

export class SourceCode {
  private readonly _id: RepositoryId; // Instance variable 1
  private readonly props: Readonly<Omit<SourceCodeProps, 'id'>>; // Instance variable 2

  private constructor(props: SourceCodeProps) {
    this._id = props.id;
    const { id, ...otherProps } = props;
    this.props = Object.freeze(otherProps);
  }

  public static create(props: {
    id?: RepositoryId;
    projectId: ProjectId;
    path: RepositoryPath;
    docsPath?: RepositoryDocsPath;
  }): SourceCode {
    const repoId = props.id || RepositoryId.generate();
    return new SourceCode({
      id: repoId,
      projectId: props.projectId,
      path: props.path,
      docsPath: props.docsPath,
      // createdAt: new Date(),
      // updatedAt: new Date(),
    });
  }

  public id(): RepositoryId {
    return this._id;
  }

  public projectId(): ProjectId {
    return this.props.projectId;
  }

  public path(): RepositoryPath {
    return this.props.path;
  }

  public docsPath(): RepositoryDocsPath | undefined {
    return this.props.docsPath;
  }

  // Example behavior method, if SourceCode entity had mutable properties
  // public updateDocsPath(newDocsPath?: RepositoryDocsPath): SourceCode {
  //   return new SourceCode({
  //     ...this.props,
  //     id: this._id,
  //     docsPath: newDocsPath,
  //     // updatedAt: new Date(),
  //   });
  // }

  public equals(other?: SourceCode): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (!(other instanceof SourceCode)) {
      return false;
    }
    return this._id.equals(other._id);
  }
}
