import { injectable, inject } from "inversify";

import { ILogger } from "@/core/common/services/i-logger.service";
import { DomainError, NotFoundError } from "@/core/domain/common/errors";
import { IProjectRepository } from "@/core/domain/project/ports/project-repository.interface";
import { Project } from "@/core/domain/project/project.entity";
import { ProjectId } from "@/core/domain/project/value-objects/project-id.vo";

import { TYPES } from "@/infrastructure/ioc/types";

export type DrizzleSchema = unknown;
export type DrizzleDB = unknown;

@injectable()
export class DrizzleProjectRepository implements IProjectRepository {
  constructor(
    @inject(TYPES.DrizzleClient) private readonly db: DrizzleDB,
    @inject(TYPES.ILogger) private readonly logger: ILogger
  ) {
    this.logger.info("[DrizzleProjectRepository] initialized");
  }

  async save(project: Project): Promise<Project> {
    this.logger.info(
      `[DrizzleProjectRepository] save called for project ID: ${project.id.value}`
    );
    // Implement actual save logic here
    return project;
  }

  async findById(id: ProjectId): Promise<Project | null> {
    this.logger.info(
      `[DrizzleProjectRepository] findById called for project ID: ${id.value}`
    );
    // Implement actual findById logic here
    return null;
  }

  async findByName(name: string): Promise<Project | null> {
    this.logger.info(
      `[DrizzleProjectRepository] findByName called for name: ${name}`
    );
    // Implement actual findByName logic here
    return null;
  }

  async findAll(): Promise<Project[]> {
    this.logger.info(`[DrizzleProjectRepository] findAll called`);
    // Implement actual findAll logic here
    return [];
  }

  async delete(id: ProjectId): Promise<void> {
    this.logger.info(
      `[DrizzleProjectRepository] delete called for project ID: ${id.value}`
    );
    // Implement actual delete logic here
  }
}
