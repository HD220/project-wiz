// src/domain/repositories/i-project.repository.ts
import { Project } from '../entities/project.entity';

export interface IProjectRepository {
  /**
   * Saves a project. Can be a new creation or an update.
   * @param project The Project entity to save.
   */
  save(project: Project): Promise<void>;

  /**
   * Finds a project by its ID.
   * @param id The ID of the project to find.
   * @returns The Project found or null.
   */
  findById(id: string): Promise<Project | null>;

  /**
   * Finds a project by its name.
   * @param name The name of the project to find.
   * @returns The Project found or null (assumes names are unique, or returns the first found).
   */
  findByName(name: string): Promise<Project | null>;

  /**
   * Lists all projects.
   * @returns A promise for an array of all Projects.
   */
  findAll(): Promise<Project[]>;

  /**
   * Deletes a project by its ID.
   * @param id The ID of the project to delete.
   */
  deleteById(id: string): Promise<void>;
}
