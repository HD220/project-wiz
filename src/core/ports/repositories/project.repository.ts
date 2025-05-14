import { IRepository } from "@/core/common/repository";
import { Project } from "@/core/domain/entities/project";

export type IProjectRepository = IRepository<typeof Project>;
