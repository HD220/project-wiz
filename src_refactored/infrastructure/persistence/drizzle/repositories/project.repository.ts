import { injectable, inject } from "inversify";

import { ILogger } from "@/core/common/services/i-logger.service";
import { DomainError, NotFoundError } from "@/core/domain/common/errors";
import { IProjectRepository } from "@/core/domain/project/ports/project-repository.interface";
import { Project } from "@/core/domain/project/project.entity";
import { ProjectId } from "@/core/domain/project/value-objects/project-id.vo";

import { TYPES } from "@/infrastructure/ioc/types";



import {
  IUseCaseResponse,
  successUseCaseResponse,
} from "@/shared/application/use-case-response.dto";

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

  async save(
    project: Project
  ): Promise<IUseCaseResponse<Project, DomainError>> {
    this.logger.info(
      `[DrizzleProjectRepository] save called for project ID: ${project.id.value}`
    );
    return successUseCaseResponse(project);
  }

  async findById(
    id: ProjectId
  ): Promise<IUseCaseResponse<Project | null, DomainError>> {
    this.logger.info(
      `[DrizzleProjectRepository] findById called for project ID: ${id.value}`
    );
    return successUseCaseResponse(null);
  }

  async findByName(
    name: string
  ): Promise<IUseCaseResponse<Project | null, DomainError>> {
    this.logger.info(
      `[DrizzleProjectRepository] findByName called for name: ${name}`
    );
    return successUseCaseResponse(null);
  }

  async listAll(): Promise<IUseCaseResponse<Project[], DomainError>> {
    this.logger.info(`[DrizzleProjectRepository] listAll called`);
    return successUseCaseResponse([]);
  }

  async delete(
    id: ProjectId
  ): Promise<IUseCaseResponse<void, DomainError | NotFoundError>> {
    this.logger.info(
      `[DrizzleProjectRepository] delete called for project ID: ${id.value}`
    );
    return successUseCaseResponse(undefined);
  }
}
