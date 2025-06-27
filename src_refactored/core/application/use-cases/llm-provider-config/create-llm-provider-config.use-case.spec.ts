// src_refactored/core/application/use-cases/llm-provider-config/create-llm-provider-config.use-case.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ZodError } from 'zod';

import { CreateLLMProviderConfigUseCase } from './create-llm-provider-config.use-case';
import { CreateLLMProviderConfigUseCaseInput } from './create-llm-provider-config.schema';

import { DomainError, ValueError } from '@/application/common/errors'; // Or @/domain/common/errors
import { LLMProviderConfig } from '@/domain/llm-provider-config/llm-provider-config.entity';
import { ILLMProviderConfigRepository } from '@/domain/llm-provider-config/ports/llm-provider-config-repository.interface';
import { ok, error } from '@/shared/result';

// Mock Repository
const mockRepo: ILLMProviderConfigRepository = {
  save: vi.fn(),
  findById: vi.fn(), // Not used in this use case directly
  findByName: vi.fn(), // Not used
  findAll: vi.fn(), // Not used
  delete: vi.fn(), // Not used
};

describe('CreateLLMProviderConfigUseCase', () => {
  let useCase: CreateLLMProviderConfigUseCase;

  const validInput: CreateLLMProviderConfigUseCaseInput = {
    name: 'OpenAI GPT-4',
    providerId: 'openai',
    apiKey: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    baseUrl: 'https://api.openai.com/v1',
  };

  const validInputNoBaseUrl: CreateLLMProviderConfigUseCaseInput = {
    name: 'Local Ollama',
    providerId: 'ollama',
    apiKey: 'ollama-is-great', // Some local models might not need a key via this field
    baseUrl: null, // Explicitly null
  };

  beforeEach(() => {
    vi.resetAllMocks();
    useCase = new CreateLLMProviderConfigUseCase(mockRepo);
  });

  it('should successfully create an LLMProviderConfig with all valid inputs', async () => {
    (mockRepo.save as vi.Mock).mockResolvedValue(ok(undefined)); // Assume save returns void on success

    const result = await useCase.execute(validInput);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.llmProviderConfigId).toBeTypeOf('string');
      // Check if it's a UUID (optional, as LLMProviderConfigId.generate() handles it)
      expect(result.value.llmProviderConfigId).toMatch(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
    }
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(mockRepo.save).toHaveBeenCalledWith(expect.any(LLMProviderConfig));
  });

  it('should successfully create an LLMProviderConfig when baseUrl is null', async () => {
    (mockRepo.save as vi.Mock).mockResolvedValue(ok(undefined));
    const result = await useCase.execute(validInputNoBaseUrl);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.llmProviderConfigId).toBeTypeOf('string');
    }
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    const savedConfig = (mockRepo.save as vi.Mock).mock.calls[0][0] as LLMProviderConfig;
    expect(savedConfig.baseUrl()).toBeUndefined(); // BaseUrl VO should not be created if input is null
  });

  it('should successfully create an LLMProviderConfig when baseUrl is undefined', async () => {
    (mockRepo.save as vi.Mock).mockResolvedValue(ok(undefined));
    const inputWithUndefinedBaseUrl = { ...validInput, baseUrl: undefined };
    const result = await useCase.execute(inputWithUndefinedBaseUrl);

    expect(result.isOk()).toBe(true);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    const savedConfig = (mockRepo.save as vi.Mock).mock.calls[0][0] as LLMProviderConfig;
    expect(savedConfig.baseUrl()).toBeUndefined();
  });

  it('should return ZodError for invalid input schema (e.g., name too short)', async () => {
    const invalidInput = { ...validInput, name: 'A' };
    const result = await useCase.execute(invalidInput);

    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(ZodError);
      expect(result.value.errors[0].message).toBe("Configuration name must be at least 3 characters long.");
    }
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should return ZodError for invalid providerId format', async () => {
    const invalidInput = { ...validInput, providerId: 'OpenAI!' }; // Contains '!'
    const result = await useCase.execute(invalidInput);
    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(ZodError);
      expect(result.value.errors[0].message).toBe("Provider ID can only contain lowercase letters, numbers, and hyphens.");
    }
  });

  it('should return ZodError for invalid baseUrl format', async () => {
    const invalidInput = { ...validInput, baseUrl: 'not-a-url' };
    const result = await useCase.execute(invalidInput);
    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(ZodError);
      expect(result.value.errors[0].message).toBe("Base URL must be a valid URL.");
    }
  });

  it('should return ValueError if a Value Object creation fails (e.g., BaseUrl internal validation)', async () => {
    // This test assumes BaseUrl.create() could throw its own specific error not caught by Zod,
    // for example, if Zod's .url() is too permissive for a specific internal rule.
    // For BaseUrl as defined in entity, its constructor throws generic Error.
    // We'll mock BaseUrl.create to throw a ValueError for testing this path.

    const originalBaseUrlCreate = LLMProviderConfig.prototype.constructor.BaseUrl.create; // Accessing BaseUrl static method via entity for mocking
    LLMProviderConfig.prototype.constructor.BaseUrl.create = vi.fn().mockImplementation(() => {
      throw new ValueError("Mocked BaseUrl VO creation failure");
    });

    const result = await useCase.execute(validInput);

    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(ValueError);
      expect(result.value.message).toBe("Mocked BaseUrl VO creation failure");
    }
    expect(mockRepo.save).not.toHaveBeenCalled();
    LLMProviderConfig.prototype.constructor.BaseUrl.create = originalBaseUrlCreate; // Restore
  });


  it('should return DomainError if repository save operation fails', async () => {
    const repoError = new DomainError('Database save failed');
    (mockRepo.save as vi.Mock).mockResolvedValue(error(repoError));

    const result = await useCase.execute(validInput);

    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(DomainError);
      expect(result.value.message).toContain('Failed to save LLM provider configuration');
      // Check if the original error is somehow wrapped or accessible if your error class supports it
      // For now, we check the message.
    }
  });
});
