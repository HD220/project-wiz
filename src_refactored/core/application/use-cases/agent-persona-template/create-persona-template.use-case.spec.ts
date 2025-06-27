// src_refactored/core/application/use-cases/agent-persona-template/create-persona-template.use-case.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ZodError } from 'zod';

import { CreatePersonaTemplateUseCase } from './create-persona-template.use-case';
import { CreatePersonaTemplateUseCaseInput } from './create-persona-template.schema';

import { DomainError, ValueError } from '@/application/common/errors'; // Or @/domain/common/errors
import { AgentPersonaTemplate } from '@/domain/agent/agent-persona-template.vo';
import { IAgentPersonaTemplateRepository } from '@/domain/agent/ports/agent-persona-template-repository.interface';
import { PersonaName } from '@/domain/agent/value-objects/persona/persona-name.vo';
// Import other VOs if specific error cases for them are tested, for now, we'll rely on Zod for input field validation
import { ok, error } from '@/shared/result';

// Mock Repository
const mockRepo: IAgentPersonaTemplateRepository = {
  save: vi.fn(),
  findById: vi.fn(), // Not used
  findByName: vi.fn(), // Not used
  findAll: vi.fn(), // Not used
  delete: vi.fn(), // Not used
};

describe('CreatePersonaTemplateUseCase', () => {
  let useCase: CreatePersonaTemplateUseCase;

  const validInput: CreatePersonaTemplateUseCaseInput = {
    name: 'Test Persona',
    role: 'Tester',
    goal: 'To test software effectively and report bugs.',
    backstory: 'Created for the purpose of rigorous testing.',
    toolNames: ['test-tool-1', 'test-tool-2'],
  };

  beforeEach(() => {
    vi.resetAllMocks();
    useCase = new CreatePersonaTemplateUseCase(mockRepo);
  });

  it('should successfully create a PersonaTemplate with valid inputs', async () => {
    (mockRepo.save as vi.Mock).mockResolvedValue(ok(undefined));

    const result = await useCase.execute(validInput);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.personaTemplateId).toBeTypeOf('string');
      expect(result.value.personaTemplateId).toMatch(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
    }
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(mockRepo.save).toHaveBeenCalledWith(expect.any(AgentPersonaTemplate));
    const savedTemplate = (mockRepo.save as vi.Mock).mock.calls[0][0] as AgentPersonaTemplate;
    expect(savedTemplate.name().value()).toBe(validInput.name);
    expect(savedTemplate.role().value()).toBe(validInput.role);
  });

  it('should successfully create with an empty toolNames array', async () => {
    (mockRepo.save as vi.Mock).mockResolvedValue(ok(undefined));
    const inputWithEmptyTools = { ...validInput, toolNames: [] };
    const result = await useCase.execute(inputWithEmptyTools);

    expect(result.isOk()).toBe(true);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    const savedTemplate = (mockRepo.save as vi.Mock).mock.calls[0][0] as AgentPersonaTemplate;
    expect(savedTemplate.toolNames().list()).toEqual([]);
  });

  it('should successfully create with an empty backstory string', async () => {
    (mockRepo.save as vi.Mock).mockResolvedValue(ok(undefined));
    const inputWithEmptyBackstory = { ...validInput, backstory: "" };
    const result = await useCase.execute(inputWithEmptyBackstory);

    expect(result.isOk()).toBe(true);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    const savedTemplate = (mockRepo.save as vi.Mock).mock.calls[0][0] as AgentPersonaTemplate;
    expect(savedTemplate.backstory().value()).toBe("");
  });


  it('should return ZodError for invalid input schema (e.g., name too short)', async () => {
    const invalidInput = { ...validInput, name: 'A' }; // Name too short based on PersonaName VO & schema
    const result = await useCase.execute(invalidInput);

    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(ZodError);
      // Adjust message based on Zod schema message
      expect(result.value.errors[0].message).toBe("Persona name must be at least 1 character long.");
    }
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should return ZodError for empty tool name in toolNames array', async () => {
    const invalidInput = { ...validInput, toolNames: ["tool-a", "  ", "tool-b"] };
    const result = await useCase.execute(invalidInput);

    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(ZodError);
      expect(result.value.errors[0].message).toBe("Tool name cannot be empty.");
    }
  });

  it('should return ValueError if a Value Object creation fails (e.g., PersonaName internal validation not caught by Zod)', async () => {
    // This test assumes a VO might have more specific validation than Zod.
    // We mock PersonaName.create to throw a ValueError.
    const originalPersonaNameCreate = PersonaName.create;
    PersonaName.create = vi.fn().mockImplementation(() => {
      throw new ValueError("Mocked PersonaName VO creation failure");
    });

    const result = await useCase.execute(validInput);

    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(ValueError);
      expect(result.value.message).toBe("Mocked PersonaName VO creation failure");
    }
    expect(mockRepo.save).not.toHaveBeenCalled();
    PersonaName.create = originalPersonaNameCreate; // Restore
  });

  it('should return DomainError if repository save operation fails', async () => {
    const repoError = new DomainError('Database save for persona template failed');
    (mockRepo.save as vi.Mock).mockResolvedValue(error(repoError));

    const result = await useCase.execute(validInput);

    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(DomainError);
      expect(result.value.message).toContain('Failed to save persona template');
    }
  });
});
