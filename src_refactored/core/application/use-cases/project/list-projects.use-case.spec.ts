// src_refactored/core/application/use-cases/project/list-projects.use-case.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ListProjectsUseCase } from './list-projects.use-case';
import { ListProjectsUseCaseInput } from './list-projects.schema';

import { DomainError } from '@/application/common/errors'; // Or @/domain/common/errors
import { Project } from '@/domain/project/project.entity';
import { IProjectRepository } from '@/domain/project/ports/project-repository.interface';
import { ProjectDescription } from '@/domain/project/value-objects/project-description.vo';
import { ProjectId } from '@/domain/project/value-objects/project-id.vo';
import { ProjectName } from '@/domain/project/value-objects/project-name.vo';
import { ok, error, Result } from '@/shared/result';

// Mock IProjectRepository
const mockProjectRepository: IProjectRepository = {
  findAll: vi.fn(),
  // Outros métodos não são necessários para este teste
  save: vi.fn(),
  findById: vi.fn(),
};

describe('ListProjectsUseCase', () => {
  let listProjectsUseCase: ListProjectsUseCase;

  beforeEach(() => {
    vi.clearAllMocks(); // Limpa mocks entre testes
    listProjectsUseCase = new ListProjectsUseCase(mockProjectRepository);
  });

  it('should return a list of project items on successful repository call', async () => {
    const now = new Date();
    const projectEntities: Project[] = [
      Project.create({
        id: ProjectId.fromString('11111111-1111-1111-1111-111111111111'),
        name: ProjectName.create('Project Alpha'),
        description: ProjectDescription.create('Desc Alpha'),
        createdAt: now,
        updatedAt: now,
      }),
      Project.create({
        id: ProjectId.fromString('22222222-2222-2222-2222-222222222222'),
        name: ProjectName.create('Project Beta'),
        description: ProjectDescription.create('Desc Beta'),
        createdAt: now,
        updatedAt: now,
      }),
    ];
    (mockProjectRepository.findAll as vi.Mock).mockResolvedValue(ok(projectEntities));

    const input: ListProjectsUseCaseInput = {}; // Input vazio conforme schema
    const result = await listProjectsUseCase.execute(input);

    expect(result.isOk()).toBe(true);
    const outputItems = result.value;
    expect(outputItems).toHaveLength(2);

    expect(outputItems[0].id).toBe('11111111-1111-1111-1111-111111111111');
    expect(outputItems[0].name).toBe('Project Alpha');
    expect(outputItems[0].createdAt).toBe(now.toISOString());

    expect(outputItems[1].id).toBe('22222222-2222-2222-2222-222222222222');
    expect(outputItems[1].name).toBe('Project Beta');
    expect(outputItems[1].createdAt).toBe(now.toISOString());

    expect(mockProjectRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return an empty list if repository returns an empty list', async () => {
    (mockProjectRepository.findAll as vi.Mock).mockResolvedValue(ok([]));
    const input: ListProjectsUseCaseInput = {};
    const result = await listProjectsUseCase.execute(input);

    expect(result.isOk()).toBe(true);
    expect(result.value).toEqual([]);
    expect(mockProjectRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return an error if repository call fails', async () => {
    const repoError = new DomainError('Repository failure');
    (mockProjectRepository.findAll as vi.Mock).mockResolvedValue(error(repoError));
    const input: ListProjectsUseCaseInput = {};
    const result = await listProjectsUseCase.execute(input);

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(DomainError);
    expect(result.value.message).toBe('Repository failure');
    expect(mockProjectRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return an error if an unexpected error occurs during mapping', async () => {
    const now = new Date();
    // Criar um mock de projeto que falhará no mapeamento (e.g., createdAt não é uma função)
    const faultyProject = {
      id: () => ({ value: () => 'faulty-id' }),
      name: () => ({ value: () => 'Faulty Project' }),
      createdAt: 'not-a-date-function', // Isso causará erro no .toISOString()
    } as any; // Cast para simular um objeto Project malformado

    (mockProjectRepository.findAll as vi.Mock).mockResolvedValue(ok([faultyProject]));
    const input: ListProjectsUseCaseInput = {};
    const result = await listProjectsUseCase.execute(input);

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(DomainError);
    expect(result.value.message).toContain('An unexpected error occurred while listing projects');
  });
});
