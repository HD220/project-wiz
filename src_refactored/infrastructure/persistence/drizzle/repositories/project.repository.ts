import { injectable, inject } from "inversify";

import { ILoggerService } from "@/core/common/services/i-logger.service";
import { DomainError, NotFoundError } from "@/core/domain/common/errors";
import { IProjectRepository } from "@/core/domain/project/ports/project-repository.interface";
import { Project } from "@/core/domain/project/project.entity";
import { ProjectId } from "@/core/domain/project/value-objects/project-id.vo";

import { TYPES } from "@/infrastructure/ioc/types";

import { Result, ok, error as _errResult } from "@/shared/result";

export type DrizzleSchema = unknown;
export type DrizzleDB = unknown;

@injectable()
export class DrizzleProjectRepository implements IProjectRepository {
  constructor(
    @inject(TYPES.DrizzleClient) private readonly db: DrizzleDB,
    @inject(TYPES.ILoggerService) private readonly logger: ILoggerService
  ) {
    this.logger.info("[DrizzleProjectRepository] initialized");
  }

  async save(project: Project): Promise<Result<Project, DomainError>> {
    this.logger.info(
      `[DrizzleProjectRepository] save called for project ID: ${project.id.value}`
    );
    return ok(project);
  }

  async findById(id: ProjectId): Promise<Result<Project | null, DomainError>> {
    this.logger.info(
      `[DrizzleProjectRepository] findById called for project ID: ${id.value}`
    );
    return ok(null);
  }

  async findByName(name: string): Promise<Result<Project | null, DomainError>> {
    this.logger.info(
      `[DrizzleProjectRepository] findByName called for name: ${name}`
    );
    return ok(null);
  }

  async listAll(): Promise<Result<Project[], DomainError>> {
    this.logger.info(`[DrizzleProjectRepository] listAll called`);
    return ok([]);
  }

  async delete(
    id: ProjectId
  ): Promise<Result<void, DomainError | NotFoundError>> {
    this.logger.info(
      `[DrizzleProjectRepository] delete called for project ID: ${id.value}`
    );
    return ok(undefined);
  }
}
