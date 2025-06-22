// src_refactored/core/domain/project/project.entity.ts
import { ProjectId } from './value-objects/project-id.vo';
import { ProjectName } from './value-objects/project-name.vo';
import { ProjectDescription } from './value-objects/project-description.vo';

interface ProjectProps {
  id: ProjectId;
  name: ProjectName;
  description: ProjectDescription;
  // createdAt: Date; // To be added for tracking
  // updatedAt: Date; // To be added for tracking
}

export class Project {
  private readonly _id: ProjectId; // Instance variable 1 (Identity)
  private readonly props: Readonly<Omit<ProjectProps, 'id'>>; // Instance variable 2 (Other properties)

  private constructor(props: ProjectProps) {
    this._id = props.id;
    // Exclude id from the 'props' spread to avoid duplication and adhere to structure
    const { id, ...otherProps } = props;
    this.props = Object.freeze(otherProps);
  }

  public static create(props: {
    id?: ProjectId;
    name: ProjectName;
    description: ProjectDescription;
  }): Project {
    const projectId = props.id || ProjectId.generate();
    // In a real application, ensure createdAt/updatedAt are handled, possibly in a base Entity class
    return new Project({
      id: projectId,
      name: props.name,
      description: props.description,
      // createdAt: new Date(),
      // updatedAt: new Date(),
    });
  }

  public id(): ProjectId {
    return this._id;
  }

  public name(): ProjectName {
    return this.props.name;
  }

  public description(): ProjectDescription {
    return this.props.description;
  }

  // Behavior methods return new instances
  public changeName(newName: ProjectName): Project {
    return new Project({
      ...this.props,
      id: this._id, // Keep the original ID
      name: newName,
      // updatedAt: new Date(),
    });
  }

  public changeDescription(newDescription: ProjectDescription): Project {
    return new Project({
      ...this.props,
      id: this._id, // Keep the original ID
      description: newDescription,
      // updatedAt: new Date(),
    });
  }

  public equals(other?: Project): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (!(other instanceof Project)) {
      return false;
    }
    return this._id.equals(other._id);
  }
}
