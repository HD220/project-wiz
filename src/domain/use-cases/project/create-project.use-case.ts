// src/domain/use-cases/project/create-project.use-case.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '@/infrastructure/ioc/types';
import { IProjectRepository } from '@/domain/repositories/i-project.repository';
import { Project } from '@/domain/entities/project.entity';

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface CreateProjectOutput {
  projectId: string;
  name: string;
  description?: string;
  createdAt: Date;
}

@injectable()
export class CreateProjectUseCase {
  constructor(
    @inject(TYPES.IProjectRepository) private projectRepository: IProjectRepository
  ) {}

  async execute(input: CreateProjectInput): Promise<CreateProjectOutput> {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Project name must be provided.');
    }

    // Optional: Check if a project with the same name already exists
    const existingProject = await this.projectRepository.findByName(input.name);
    if (existingProject) {
      throw new Error(`A project with the name "${input.name}" already exists.`);
    }

    const project = Project.create({
      name: input.name,
      description: input.description,
    });

    await this.projectRepository.save(project);

    return {
      projectId: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.props.createdAt,
    };
  }
}
