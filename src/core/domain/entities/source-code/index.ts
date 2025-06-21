import { ProjectId } from "../project/value-objects";
import { RepositoryDocsPath, RepositoryPath } from "./value-objects";
import { RepositoryId } from "./value-objects/repository-id.vo";

type SourceCodeConstructor = {
  id: RepositoryId;
  path: RepositoryPath;
  docsPath: RepositoryDocsPath;
  projectId: ProjectId;
};

// TODO: OBJECT_CALISTHENICS_REFACTOR: This class is undergoing refactoring.
// The `getProps()` method is a temporary measure for external consumers.
// Ideally, direct state access will be replaced by more behavior-oriented methods.
export class SourceCode {
  private constructor(private readonly fields: SourceCodeConstructor) { // Changed to private
    // Assuming props are validated by the static create method.
    // VOs themselves are already validated.
  }

  public static create(props: SourceCodeConstructor): SourceCode {
    if (
      !props.id ||
      !props.path ||
      !props.docsPath ||
      !props.projectId
    ) {
      // Consider using DomainError from '@/core/common/errors'
      throw new Error(
        "SourceCode ID, Path, DocsPath, and ProjectId are mandatory for SourceCode creation."
      );
    }
    return new SourceCode(props);
  }

  public id(): RepositoryId {
      !fields.docsPath ||
      !fields.projectId
    ) {
      this.fields.path.equals(other.fields.path) && // Assumes RepositoryPath has .equals()
      this.fields.docsPath.equals(other.fields.docsPath) && // Assumes RepositoryDocsPath has .equals()
      this.fields.projectId.equals(other.fields.projectId) // Assumes ProjectId has .equals()
    );
  }
}
    return this.fields.id;
  }

  public getProps(): Readonly<SourceCodeConstructor> {
    return { ...this.fields };
  }

  // Individual getters removed.

  public equals(other?: SourceCode): boolean {
    if (this === other) return true;
    if (!other || !(other instanceof SourceCode)) return false;

    return (
      this.fields.id.equals(other.fields.id) &&
      this.fields.path.equals(other.fields.path) && // Assumes RepositoryPath has .equals()
      this.fields.docsPath.equals(other.fields.docsPath) && // Assumes RepositoryDocsPath has .equals()
      this.fields.projectId.equals(other.fields.projectId) // Assumes ProjectId has .equals()
    );
  }
}
