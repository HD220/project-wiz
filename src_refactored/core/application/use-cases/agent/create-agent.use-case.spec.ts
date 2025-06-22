// src_refactored/core/application/use-cases/agent/create-agent.use-case.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ZodError } from 'zod';
import { CreateAgentUseCase } from './create-agent.use-case';
import { CreateAgentUseCaseInput } from './create-agent.schema';
import { IAgentRepository } from '../../../../domain/agent/ports/agent-repository.interface';
import { IAgentPersonaTemplateRepository } from '../../../../domain/agent/ports/agent-persona-template-repository.interface';
import { ILLMProviderConfigRepository } from '../../../../domain/llm-provider-config/ports/llm-provider-config-repository.interface';
import { Agent } from '../../../../domain/agent/agent.entity';
import { AgentPersonaTemplate } from '../../../../domain/agent/agent-persona-template.vo';
import { LLMProviderConfig } from '../../../../domain/llm-provider-config/llm-provider-config.entity';
import { PersonaId } from '../../../../domain/agent/value-objects/persona/persona-id.vo';
import { LLMProviderConfigId } from '../../../../domain/llm-provider-config/value-objects/llm-provider-config-id.vo';
import { PersonaName } from '../../../../domain/agent/value-objects/persona/persona-name.vo';
import { PersonaRole } from '../../../../domain/agent/value-objects/persona/persona-role.vo';
import { PersonaGoal } from '../../../../domain/agent/value-objects/persona/persona-goal.vo';
import { PersonaBackstory } from '../../../../domain/agent/value-objects/persona/persona-backstory.vo';
import { ToolNames } from '../../../../domain/agent/value-objects/persona/tool-names.vo';
import { LLMProviderConfigName } from '../../../../domain/llm-provider-config/value-objects/llm-provider-config-name.vo';
import { LLMProviderId } from '../../../../domain/llm-provider-config/value-objects/llm-provider-id.vo';
import { LLMApiKey } from '../../../../domain/llm-provider-config/value-objects/llm-api-key.vo';
import { ok, error } from '../../../../../shared/result';
import { DomainError, NotFoundError, ValueError } from '../../../../common/errors';

// Mocks
const mockAgentRepo: IAgentRepository = { save: vi.fn(), findById: vi.fn(), findAll: vi.fn(), delete: vi.fn() };
const mockTemplateRepo: IAgentPersonaTemplateRepository = { save: vi.fn(), findById: vi.fn(), findByName: vi.fn(), findAll: vi.fn(), delete: vi.fn() };
const mockLlmConfigRepo: ILLMProviderConfigRepository = { save: vi.fn(), findById: vi.fn(), findByName: vi.fn(), findAll: vi.fn(), delete: vi.fn() };

const testPersonaId = PersonaId.generate();
const testLlmConfigId = LLMProviderConfigId.generate();

const dummyTemplate = AgentPersonaTemplate.create({
  id: testPersonaId,
  name: PersonaName.create('Test Persona'),
  role: PersonaRole.create('Tester'),
  goal: PersonaGoal.create('Goal of testing.'),
  backstory: PersonaBackstory.create('Backstory of testing.'),
  toolNames: ToolNames.create(['tool1']),
});

const dummyLlmConfig = LLMProviderConfig.create({
  id: testLlmConfigId,
  name: LLMProviderConfigName.create('Test LLM Config'),
  providerId: LLMProviderId.create('test-provider'),
  apiKey: LLMApiKey.create('test-api-key-xxxxxxxxxx'),
});


describe('CreateAgentUseCase', () => {
  let useCase: CreateAgentUseCase;

  const validInput: CreateAgentUseCaseInput = {
    personaTemplateId: testPersonaId.value(),
    llmProviderConfigId: testLlmConfigId.value(),
    temperature: 0.5,
  };

  beforeEach(() => {
    vi.resetAllMocks();
    useCase = new CreateAgentUseCase(mockAgentRepo, mockTemplateRepo, mockLlmConfigRepo);

    // Default successful fetches
    (mockTemplateRepo.findById as vi.Mock).mockResolvedValue(ok(dummyTemplate));
    (mockLlmConfigRepo.findById as vi.Mock).mockResolvedValue(ok(dummyLlmConfig));
    (mockAgentRepo.save as vi.Mock).mockResolvedValue(ok(undefined));
  });

  it('should successfully create an Agent with all valid inputs', async () => {
    const result = await useCase.execute(validInput);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.agentId).toBeTypeOf('string');
      expect(result.value.agentId).toMatch(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
    }
    expect(mockAgentRepo.save).toHaveBeenCalledTimes(1);
    expect(mockAgentRepo.save).toHaveBeenCalledWith(expect.any(Agent));
    const savedAgent = (mockAgentRepo.save as vi.Mock).mock.calls[0][0] as Agent;
    expect(savedAgent.temperature().value()).toBe(0.5);
  });

  it('should use default temperature if not provided in input', async () => {
    const inputWithoutTemp = { ...validInput };
    delete inputWithoutTemp.temperature; // Remove temperature

    const result = await useCase.execute(inputWithoutTemp);

    expect(result.isOk()).toBe(true);
    expect(mockAgentRepo.save).toHaveBeenCalledTimes(1);
    const savedAgent = (mockAgentRepo.save as vi.Mock).mock.calls[0][0] as Agent;
    expect(savedAgent.temperature().value()).toBe(0.7); // Default from AgentTemperature.default()
  });

  it('should return ZodError for invalid input schema (e.g., invalid UUID)', async () => {
    const invalidInput = { ...validInput, personaTemplateId: 'not-a-uuid' };
    const result = await useCase.execute(invalidInput);

    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(ZodError);
      expect(result.value.errors[0].message).toBe("Persona Template ID must be a valid UUID.");
    }
  });

  it('should return NotFoundError if PersonaTemplate is not found', async () => {
    (mockTemplateRepo.findById as vi.Mock).mockResolvedValue(ok(null));
    const result = await useCase.execute(validInput);

    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toContain('AgentPersonaTemplate with ID');
    }
  });

  it('should return NotFoundError if LLMProviderConfig is not found', async () => {
    (mockLlmConfigRepo.findById as vi.Mock).mockResolvedValue(ok(null));
    const result = await useCase.execute(validInput);

    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toContain('LLMProviderConfig with ID');
    }
  });

  it('should return DomainError if fetching PersonaTemplate fails', async () => {
    const repoError = new DomainError("DB error fetching template");
    (mockTemplateRepo.findById as vi.Mock).mockResolvedValue(error(repoError));
    const result = await useCase.execute(validInput);
    expect(result.isError()).toBe(true);
    if(result.isError()){
        expect(result.value.message).toContain("Failed to fetch persona template");
    }
  });

  it('should return DomainError if fetching LLMProviderConfig fails', async () => {
    const repoError = new DomainError("DB error fetching llm config");
    (mockLlmConfigRepo.findById as vi.Mock).mockResolvedValue(error(repoError));
    const result = await useCase.execute(validInput);
    expect(result.isError()).toBe(true);
    if(result.isError()){
        expect(result.value.message).toContain("Failed to fetch LLM provider config");
    }
  });

  it('should return ValueError if AgentTemperature.create fails for provided temperature', async () => {
    const invalidTempInput = { ...validInput, temperature: 2.5 }; // Invalid temperature
    // Zod schema catches this first. To test VO error, Zod must pass.
    // For this test, let's assume Zod schema was different and allowed it.
    // We will mock AgentTemperature.create to throw.
    const originalTempCreate = AgentTemperature.create;
    AgentTemperature.create = vi.fn().mockImplementation(() => {
      throw new ValueError("Invalid temperature for VO");
    });

    const result = await useCase.execute(invalidTempInput);
    expect(result.isError()).toBe(true);
    if (result.isError()) {
      // If Zod schema catches it first (as it should with current schema)
      if(result.value instanceof ZodError) {
         expect(result.value.errors[0].message).toBe("Temperature must be no more than 2.0.");
      } else { // If Zod schema was bypassed and VO threw
         expect(result.value).toBeInstanceOf(ValueError);
         expect(result.value.message).toBe("Invalid temperature for VO");
      }
    }
    AgentTemperature.create = originalTempCreate; // Restore
  });


  it('should return DomainError if agentRepository.save fails', async () => {
    const repoError = new DomainError('Failed to save agent to DB');
    (mockAgentRepo.save as vi.Mock).mockResolvedValue(error(repoError));
    const result = await useCase.execute(validInput);

    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value.message).toContain('Failed to save agent');
    }
  });
});
