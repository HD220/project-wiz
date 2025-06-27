// src_refactored/core/application/use-cases/agent-internal-state/save-agent-internal-state.use-case.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ZodError } from 'zod';

import { DomainError, ValueError } from '@/application/common/errors'; // Or @/domain/common/errors

import { AgentInternalState } from '@/domain/agent/agent-internal-state.entity';
import { IAgentInternalStateRepository } from '@/domain/agent/ports/agent-internal-state-repository.interface';
import { AgentId } from '@/domain/agent/value-objects/agent-id.vo';
import { CurrentGoal } from '@/domain/agent/value-objects/internal-state/current-goal.vo';
import { CurrentProjectId } from '@/domain/agent/value-objects/internal-state/current-project-id.vo';
import { GeneralNotesCollection } from '@/domain/agent/value-objects/internal-state/general-notes.collection';

import { ok, error } from '@/shared/result';

import { SaveAgentInternalStateUseCaseInput } from './save-agent-internal-state.schema';
import { SaveAgentInternalStateUseCase } from './save-agent-internal-state.use-case';

// Mock Repository
const mockStateRepo: IAgentInternalStateRepository = {
  save: vi.fn(),
  findByAgentId: vi.fn(), // This will be used by SaveUseCase to check existing
  // deleteByAgentId: vi.fn(), // Not used here
};

describe('SaveAgentInternalStateUseCase', () => {
  let useCase: SaveAgentInternalStateUseCase;
  const testAgentId = AgentId.generate();
  const testProjectId = CurrentProjectId.fromString('project-uuid-12345');
  const testGoal = CurrentGoal.create('Initial test goal');
  const testNotes = GeneralNotesCollection.create(['note 1', 'note 2']);

  const existingState = AgentInternalState.create({
    agentId: testAgentId,
    currentProjectId: testProjectId,
    currentGoal: testGoal,
    generalNotes: testNotes,
  });

  const baseInput: SaveAgentInternalStateUseCaseInput = {
    agentId: testAgentId.value(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    useCase = new SaveAgentInternalStateUseCase(mockStateRepo);
  });

  it('should create a new state if none exists for the agentId', async () => {
    (mockStateRepo.findByAgentId as vi.Mock).mockResolvedValue(ok(null));
    (mockStateRepo.save as vi.Mock).mockResolvedValue(ok(undefined));

    const input: SaveAgentInternalStateUseCaseInput = {
      ...baseInput,
      currentProjectId: testProjectId.value(),
      currentGoal: testGoal.value(),
      generalNotes: ['new note 1', 'new note 2'],
    };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    expect(result.value).toEqual({ success: true });
    expect(mockStateRepo.save).toHaveBeenCalledTimes(1);
    const savedState = (mockStateRepo.save as vi.Mock).mock.calls[0][0] as AgentInternalState;
    expect(savedState.agentId().equals(testAgentId)).toBe(true);
    expect(savedState.currentProjectId()?.value()).toBe(testProjectId.value());
    expect(savedState.currentGoal()?.value()).toBe(testGoal.value());
    expect(savedState.generalNotes().list()).toEqual(['new note 1', 'new note 2']);
  });

  it('should update an existing state with all provided fields', async () => {
    (mockStateRepo.findByAgentId as vi.Mock).mockResolvedValue(ok(existingState));
    (mockStateRepo.save as vi.Mock).mockResolvedValue(ok(undefined));

    const newProjectId = CurrentProjectId.fromString('project-uuid-67890');
    const newGoal = 'Updated goal';
    const newNotes = ['updated note'];

    const input: SaveAgentInternalStateUseCaseInput = {
      ...baseInput,
      currentProjectId: newProjectId.value(),
      currentGoal: newGoal,
      generalNotes: newNotes,
    };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    expect(mockStateRepo.save).toHaveBeenCalledTimes(1);
    const savedState = (mockStateRepo.save as vi.Mock).mock.calls[0][0] as AgentInternalState;
    expect(savedState.currentProjectId()?.value()).toBe(newProjectId.value());
    expect(savedState.currentGoal()?.value()).toBe(newGoal);
    expect(savedState.generalNotes().list()).toEqual(newNotes);
  });

  it('should update only currentGoal if only it is provided', async () => {
    (mockStateRepo.findByAgentId as vi.Mock).mockResolvedValue(ok(existingState));
    (mockStateRepo.save as vi.Mock).mockResolvedValue(ok(undefined));
    const newGoal = 'Only goal updated';
    const input: SaveAgentInternalStateUseCaseInput = { ...baseInput, currentGoal: newGoal };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    const savedState = (mockStateRepo.save as vi.Mock).mock.calls[0][0] as AgentInternalState;
    expect(savedState.currentGoal()?.value()).toBe(newGoal);
    expect(savedState.currentProjectId()?.equals(existingState.currentProjectId()!)).toBe(true); // Should be unchanged
    expect(savedState.generalNotes().equals(existingState.generalNotes())).toBe(true); // Should be unchanged
  });

  it('should clear currentProjectId if null is provided in input', async () => {
    (mockStateRepo.findByAgentId as vi.Mock).mockResolvedValue(ok(existingState));
    (mockStateRepo.save as vi.Mock).mockResolvedValue(ok(undefined));
    const input: SaveAgentInternalStateUseCaseInput = { ...baseInput, currentProjectId: null };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    const savedState = (mockStateRepo.save as vi.Mock).mock.calls[0][0] as AgentInternalState;
    expect(savedState.currentProjectId()).toBeUndefined();
  });

  it('should clear currentGoal if null is provided in input', async () => {
    (mockStateRepo.findByAgentId as vi.Mock).mockResolvedValue(ok(existingState));
    (mockStateRepo.save as vi.Mock).mockResolvedValue(ok(undefined));
    const input: SaveAgentInternalStateUseCaseInput = { ...baseInput, currentGoal: null };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    const savedState = (mockStateRepo.save as vi.Mock).mock.calls[0][0] as AgentInternalState;
    // CurrentGoal VO allows empty string, so 'null' input might become CurrentGoal.create('') or undefined for the entity method
    // The entity's changeCurrentGoal(undefined) is used, so it should be undefined.
    expect(savedState.currentGoal()).toBeUndefined();
  });

  it('should replace generalNotes with an empty array if empty array is provided', async () => {
    (mockStateRepo.findByAgentId as vi.Mock).mockResolvedValue(ok(existingState));
    (mockStateRepo.save as vi.Mock).mockResolvedValue(ok(undefined));
    const input: SaveAgentInternalStateUseCaseInput = { ...baseInput, generalNotes: [] };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    const savedState = (mockStateRepo.save as vi.Mock).mock.calls[0][0] as AgentInternalState;
    expect(savedState.generalNotes().isEmpty()).toBe(true);
  });

  it('should not change fields if they are not provided in input for an existing state', async () => {
    (mockStateRepo.findByAgentId as vi.Mock).mockResolvedValue(ok(existingState));
    (mockStateRepo.save as vi.Mock).mockResolvedValue(ok(undefined));
    const input: SaveAgentInternalStateUseCaseInput = { ...baseInput }; // Only agentId
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    const savedState = (mockStateRepo.save as vi.Mock).mock.calls[0][0] as AgentInternalState;
    expect(savedState.currentProjectId()?.equals(existingState.currentProjectId()!)).toBe(true);
    expect(savedState.currentGoal()?.equals(existingState.currentGoal()!)).toBe(true);
    expect(savedState.generalNotes().equals(existingState.generalNotes())).toBe(true);
  });

  it('should return ZodError for invalid agentId format', async () => {
    const input: SaveAgentInternalStateUseCaseInput = { agentId: 'not-a-uuid' };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) expect(result.value).toBeInstanceOf(ZodError);
  });

  it('should return DomainError if findByAgentId from repository fails', async () => {
    const repoError = new DomainError('DB find error');
    (mockStateRepo.findByAgentId as vi.Mock).mockResolvedValue(error(repoError));
    const result = await useCase.execute(baseInput);
    expect(result.isError()).toBe(true);
    if (result.isError()) {
        expect(result.value).toBeInstanceOf(DomainError);
        expect(result.value.message).toContain('Failed to check existing state');
    }
  });

  it('should return DomainError if save to repository fails', async () => {
    (mockStateRepo.findByAgentId as vi.Mock).mockResolvedValue(ok(null)); // Simulate new state
    const repoError = new DomainError('DB save error');
    (mockStateRepo.save as vi.Mock).mockResolvedValue(error(repoError));
    const result = await useCase.execute(baseInput);
    expect(result.isError()).toBe(true);
    if (result.isError()) {
        expect(result.value).toBeInstanceOf(DomainError);
        expect(result.value.message).toContain('Failed to save agent internal state');
    }
  });

  it('should return ValueError if a VO creation fails (e.g. invalid currentGoal string for VO)', async () => {
    const invalidGoalInput = { ...baseInput, currentGoal: "g".repeat(501) }; // Exceeds CurrentGoal MAX_LENGTH
    // Note: Zod schema for currentGoal also has max(500). If Zod catches it, this path won't be hit.
    // This test assumes Zod validation for length might be different or bypassed for some reason to test VO error.
    // For this specific case, Zod will catch it. A better test for VO error would be if VO had a rule Zod doesn't.
    // Let's assume Zod's max is higher for this test's purpose or mock CurrentGoal.create to throw.

    const originalGoalCreate = CurrentGoal.create;
    CurrentGoal.create = vi.fn().mockImplementation(() => { throw new ValueError("Mocked CurrentGoal creation error"); });

    const result = await useCase.execute({ ...baseInput, currentGoal: "some goal that will trigger mock" });
    expect(result.isError()).toBe(true);
    if (result.isError()) {
        expect(result.value).toBeInstanceOf(ValueError);
        expect(result.value.message).toBe("Mocked CurrentGoal creation error");
    }
    CurrentGoal.create = originalGoalCreate; // Restore
  });
});
