import { ProjectDescription, ProjectId, ProjectName } from "./value-objects";

export type ProjectConstructor = {
  id: ProjectId;
  name: ProjectName;
  description: ProjectDescription;
};

// TODO: OBJECT_CALISTHENICS_REFACTOR: This class is undergoing refactoring.
// The `getProps()` method is a temporary measure for external consumers.
// Ideally, direct state access will be replaced by more behavior-oriented methods.
export class Project {
  private constructor(private readonly fields: ProjectConstructor) { // Changed to private
    // Assuming props are validated by the static create method.
    // VOs themselves are already validated.
  }

  public static create(props: ProjectConstructor): Project {
    if (!props.id || !props.name || !props.description) {
        // Consider using DomainError from '@/core/common/errors'
        throw new Error("Project ID, Name, and Description are mandatory for Project creation.");
    }
    return new Project(props);
  }

  // Getter for id removed, replaced by id() method
  // get id() {
  //   return this.fields.id;
  // }

  public id(): ProjectId {
    return this.fields.id;
  }

  public getProps(): Readonly<ProjectConstructor> {
    return { ...this.fields };
  }

  public equals(other?: Project): boolean {
    if (this === other) return true;
    if (!other || !(other instanceof Project)) return false;
    return (
      this.fields.id.equals(other.fields.id) &&
      this.fields.name.equals(other.fields.name) &&
      this.fields.description.equals(other.fields.description)
    );
  }
}
