// src_refactored/core/application/use-cases/agent-internal-state/load-agent-internal-state.use-case.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ZodError } from 'zod';

import { AgentInternalState } from '@/domain/agent/agent-internal-state.entity';
import { IAgentInternalStateRepository } from '@/domain/agent/ports/agent-internal-state-repository.interface';
import { DomainError } from '@/application/common/errors'; // Assuming ApplicationError context or DomainError if it's from domain
import { AgentId } from '@/domain/agent/value-objects/agent-id.vo';
import { CurrentGoal } from '@/domain/agent/value-objects/internal-state/current-goal.vo';
import { CurrentProjectId } from '@/domain/agent/value-objects/internal-state/current-project-id.vo';
import { GeneralNotesCollection } from '@/domain/agent/value-objects/internal-state/general-notes.collection';

import { ok, error } from '@/shared/result';

import { LoadAgentInternalStateUseCaseInput } from './load-agent-internal-state.schema';
import { LoadAgentInternalStateUseCase } from './load-agent-internal-state.use-case';

// Mock Repository
const mockStateRepo: IAgentInternalStateRepository = {
  save: vi.fn(),
  findByAgentId: vi.fn(),
  deleteByAgentId: vi.fn(),
};

describe('LoadAgentInternalStateUseCase', () => {
  let useCase: LoadAgentInternalStateUseCase;
  const testAgentId = AgentId.generate();
  const testProjectId = CurrentProjectId.fromString('project-uuid-123');
  const testGoal = CurrentGoal.create('Test goal');
  const testNotes = GeneralNotesCollection.create(['note A', 'note B']);

  const existingStateEntity = AgentInternalState.create({
    agentId: testAgentId,
    currentProjectId: testProjectId,
    currentGoal: testGoal,
    generalNotes: testNotes,
  });

  const existingStateEntityNoOptionals = AgentInternalState.create({
    agentId: testAgentId,
    // currentProjectId is undefined
    // currentGoal is undefined (will use empty string if CurrentGoal.create('') is called by entity)
    generalNotes: GeneralNotesCollection.create([]),
  });


  beforeEach(() => {
    vi.resetAllMocks();
    useCase = new LoadAgentInternalStateUseCase(mockStateRepo);
  });

  it('should return agent internal state when found', async () => {
    (mockStateRepo.findByAgentId as vi.Mock).mockResolvedValue(ok(existingStateEntity));
    const input: LoadAgentInternalStateUseCaseInput = { agentId: testAgentId.value() };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    const output = result.value;
    expect(output).not.toBeNull();
    if (output) {
      expect(output.agentId).toBe(testAgentId.value());
      expect(output.currentProjectId).toBe(testProjectId.value());
      expect(output.currentGoal).toBe(testGoal.value());
      expect(output.generalNotes).toEqual(['note A', 'note B']);
    }
  });

  it('should correctly map null/undefined optional fields from entity to null in DTO', async () => {
    (mockStateRepo.findByAgentId as vi.Mock).mockResolvedValue(ok(existingStateEntityNoOptionals));
    const input: LoadAgentInternalStateUseCaseInput = { agentId: testAgentId.value() };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    const output = result.value;
    expect(output).not.toBeNull();
    if (output) {
      expect(output.agentId).toBe(testAgentId.value());
      expect(output.currentProjectId).toBeNull();
      // CurrentGoal.create('') results in value "", which is not null.
      // If CurrentGoal was undefined in entity, its .value() would error.
      // Entity creates CurrentGoal.create('') if undefined, so it should be ""
      // The use case maps `stateEntity.currentGoal()?.value() || null`.
      // If CurrentGoal.create('') makes `value` an empty string, then output.currentGoal should be "".
      // If CurrentGoal.create(undefined) was possible and made .value() undefined, then it'd be null.
      // Let's assume CurrentGoal.create('') is what happens for an undefined input to AgentInternalState.create
      const expectedGoal = existingStateEntityNoOptionals.currentGoal() ? existingStateEntityNoOptionals.currentGoal()!.value() : null;
      expect(output.currentGoal).toBe(expectedGoal);
      expect(output.generalNotes).toEqual([]);
    }
  });


  it('should return ok with null if agent internal state is not found', async () => {
    (mockStateRepo.findByAgentId as vi.Mock).mockResolvedValue(ok(null));
    const input: LoadAgentInternalStateUseCaseInput = { agentId: testAgentId.value() };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    expect(result.value).toBeNull();
  });

  it('should return ZodError for invalid agentId format in input', async () => {
    const input: LoadAgentInternalStateUseCaseInput = { agentId: 'not-a-uuid' };
    const result = await useCase.execute(input);

    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(ZodError);
      expect(result.value.errors[0].message).toBe("Agent ID must be a valid UUID.");
    }
  });

  it('should return DomainError if repository findByAgentId operation fails', async () => {
    const repoError = new DomainError('Database find error');
    (mockStateRepo.findByAgentId as vi.Mock).mockResolvedValue(error(repoError));
    const input: LoadAgentInternalStateUseCaseInput = { agentId: testAgentId.value() };
    const result = await useCase.execute(input);

    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(DomainError);
      expect(result.value.message).toContain('Failed to load internal state');
    }
  });

  it('should return DomainError for unexpected errors during VO creation (e.g. invalid UUID from DB)', async () => {
    // This tests if AgentId.fromString fails during input processing
    const originalFromString = AgentId.fromString;
    AgentId.fromString = vi.fn().mockImplementation(() => { throw new Error("Mocked VO error"); });

    const input: LoadAgentInternalStateUseCaseInput = { agentId: testAgentId.value() };
    const result = await useCase.execute(input);

    expect(result.isError()).toBe(true);
    if(result.isError()){
        expect(result.value).toBeInstanceOf(DomainError);
        expect(result.value.message).toContain("Unexpected error loading agent state");
    }
    AgentId.fromString = originalFromString; // Restore
  });
});
