// src_refactored/core/application/use-cases/project/get-project-details.use-case.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';


import { IProjectRepository } from '@/domain/project/ports/project-repository.interface';
import { Project } from '@/domain/project/project.entity';
import { ProjectDescription } from '@/domain/project/value-objects/project-description.vo';
import { ProjectId } from '@/domain/project/value-objects/project-id.vo';
import { ProjectName } from '@/domain/project/value-objects/project-name.vo';
import { ISourceCodeRepository } from '@/domain/source-code/ports/source-code-repository.interface';
import { SourceCode } from '@/domain/source-code/source-code.entity';
import { RepositoryDocsPath } from '@/domain/source-code/value-objects/repository-docs-path.vo';
import { RepositoryId } from '@/domain/source-code/value-objects/repository-id.vo';
import { RepositoryPath } from '@/domain/source-code/value-objects/repository-path.vo';

import { DomainError, NotFoundError } from '@/application/common/errors'; // Or @/domain/common/errors

import { ok, error } from '@/shared/result';

import { GetProjectDetailsUseCaseInput } from './get-project-details.schema';
import { GetProjectDetailsUseCase } from './get-project-details.use-case';

// Mocks
const mockProjectRepository: IProjectRepository = {
  findById: vi.fn(),
  findAll: vi.fn(), // Added to satisfy interface, not used here
  save: vi.fn(),    // Added to satisfy interface, not used here
};

const mockSourceCodeRepository: ISourceCodeRepository = {
  findByProjectId: vi.fn(),
  findById: vi.fn(), // Added to satisfy interface
  save: vi.fn(),     // Added to satisfy interface
};

describe('GetProjectDetailsUseCase', () => {
  let getProjectDetailsUseCase: GetProjectDetailsUseCase;
  const testProjectId = '123e4567-e89b-12d3-a456-426614174000';
  const testProjectIdVo = ProjectId.fromString(testProjectId);
  const now = new Date();

  const projectEntity = Project.create({
    id: testProjectIdVo,
    name: ProjectName.create('Test Project'),
    description: ProjectDescription.create('Test Description'),
    createdAt: now,
    updatedAt: now,
  });

  const sourceCodeEntity = SourceCode.create({
    id: RepositoryId.generate(),
    projectId: testProjectIdVo,
    path: RepositoryPath.create('/path/to/repo'),
    docsPath: RepositoryDocsPath.create('/path/to/docs'),
  });

  const sourceCodeEntityNoDocs = SourceCode.create({
    id: RepositoryId.generate(),
    projectId: testProjectIdVo,
    path: RepositoryPath.create('/path/to/repo/nodocs'),
    // docsPath is undefined here
  });

  beforeEach(() => {
    vi.resetAllMocks();
    getProjectDetailsUseCase = new GetProjectDetailsUseCase(
      mockProjectRepository,
      mockSourceCodeRepository,
    );
  });

  it('should return project details with source code when both are found', async () => {
    (mockProjectRepository.findById as vi.Mock).mockResolvedValue(ok(projectEntity));
    (mockSourceCodeRepository.findByProjectId as vi.Mock).mockResolvedValue(ok(sourceCodeEntity));

    const input: GetProjectDetailsUseCaseInput = { projectId: testProjectId };
    const result = await getProjectDetailsUseCase.execute(input);

    expect(result.isOk()).toBe(true);
    const details = result.value;
    expect(details.id).toBe(testProjectId);
    expect(details.name).toBe('Test Project');
    expect(details.description).toBe('Test Description');
    expect(details.createdAt).toBe(now.toISOString());
    expect(details.updatedAt).toBe(now.toISOString());
    expect(details.sourceCode).not.toBeNull();
    expect(details.sourceCode?.id).toBe(sourceCodeEntity.id().value());
    expect(details.sourceCode?.repositoryPath).toBe('/path/to/repo');
    expect(details.sourceCode?.docsPath).toBe('/path/to/docs');
  });

  it('should return project details with source code (null docsPath) if docsPath is undefined in entity', async () => {
    (mockProjectRepository.findById as vi.Mock).mockResolvedValue(ok(projectEntity));
    (mockSourceCodeRepository.findByProjectId as vi.Mock).mockResolvedValue(ok(sourceCodeEntityNoDocs));

    const input: GetProjectDetailsUseCaseInput = { projectId: testProjectId };
    const result = await getProjectDetailsUseCase.execute(input);

    expect(result.isOk()).toBe(true);
    const details = result.value;
    expect(details.sourceCode).not.toBeNull();
    expect(details.sourceCode?.id).toBe(sourceCodeEntityNoDocs.id().value());
    expect(details.sourceCode?.repositoryPath).toBe('/path/to/repo/nodocs');
    expect(details.sourceCode?.docsPath).toBeNull();
  });

  it('should return project details with null sourceCode when SourceCode is not found', async () => {
    (mockProjectRepository.findById as vi.Mock).mockResolvedValue(ok(projectEntity));
    (mockSourceCodeRepository.findByProjectId as vi.Mock).mockResolvedValue(ok(null)); // SourceCode not found

    const input: GetProjectDetailsUseCaseInput = { projectId: testProjectId };
    const result = await getProjectDetailsUseCase.execute(input);

    expect(result.isOk()).toBe(true);
    const details = result.value;
    expect(details.id).toBe(testProjectId);
    expect(details.name).toBe('Test Project');
    expect(details.sourceCode).toBeNull();
  });

  it('should return NotFoundError if project is not found', async () => {
    (mockProjectRepository.findById as vi.Mock).mockResolvedValue(ok(null));

    const input: GetProjectDetailsUseCaseInput = { projectId: testProjectId };
    const result = await getProjectDetailsUseCase.execute(input);

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
    expect(result.value.message).toBe(`Project with ID ${testProjectId} not found.`);
  });

  it('should return error if projectRepository.findById fails', async () => {
    const repoError = new DomainError('Project repo failure');
    (mockProjectRepository.findById as vi.Mock).mockResolvedValue(error(repoError));

    const input: GetProjectDetailsUseCaseInput = { projectId: testProjectId };
    const result = await getProjectDetailsUseCase.execute(input);

    expect(result.isError()).toBe(true);
    expect(result.value).toEqual(repoError);
  });

  it('should return project details with null sourceCode if sourceCodeRepository.findByProjectId fails (and log warning)', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    (mockProjectRepository.findById as vi.Mock).mockResolvedValue(ok(projectEntity));
    const sourceCodeRepoError = new DomainError('SourceCode repo failure');
    (mockSourceCodeRepository.findByProjectId as vi.Mock).mockResolvedValue(error(sourceCodeRepoError));

    const input: GetProjectDetailsUseCaseInput = { projectId: testProjectId };
    const result = await getProjectDetailsUseCase.execute(input);

    expect(result.isOk()).toBe(true); // Still ok, as per current logic
    const details = result.value;
    expect(details.id).toBe(testProjectId);
    expect(details.sourceCode).toBeNull();
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining(`Error fetching source code for project ${testProjectId}`));
    consoleWarnSpy.mockRestore();
  });

  it('should return error if ProjectId.fromString throws (e.g. invalid UUID format)', async () => {
    const invalidProjectId = "not-a-uuid";
    const input: GetProjectDetailsUseCaseInput = { projectId: invalidProjectId };
    const result = await getProjectDetailsUseCase.execute(input);

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(DomainError); // Or specific error from VO if it throws that
    expect(result.value.message).toContain('Invalid UUID format');
  });
});
