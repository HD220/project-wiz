import { describe, it, expect, beforeEach } from 'vitest';
import { PromptRepositoryImpl } from './PromptRepositoryImpl';
import { Prompt } from '../domain/Prompt';

describe('PromptRepositoryImpl', () => {
  let promptRepository: PromptRepositoryImpl;

  beforeEach(() => {
    promptRepository = new PromptRepositoryImpl();
  });

  it('should save a prompt', async () => {
    const prompt = new Prompt('1', 'Test prompt', new Date());
    await promptRepository.save(prompt);
    const savedPrompt = await promptRepository.findById('1');
    expect(savedPrompt).toEqual(prompt);
  });

  it('should throw an error when saving an invalid prompt', async () => {
    const invalidPrompt = new Prompt('', '', new Date());
    await expect(promptRepository.save(invalidPrompt)).rejects.toThrow('Invalid prompt data');
  });

  it('should find all prompts', async () => {
    const prompt1 = new Prompt('1', 'Test prompt 1', new Date());
    const prompt2 = new Prompt('2', 'Test prompt 2', new Date());
    await promptRepository.save(prompt1);
    await promptRepository.save(prompt2);
    const prompts = await promptRepository.findAll();
    expect(prompts).toEqual([prompt1, prompt2]);
  });

  it('should delete a prompt', async () => {
    const prompt = new Prompt('1', 'Test prompt', new Date());
    await promptRepository.save(prompt);
    await promptRepository.delete('1');
    const deletedPrompt = await promptRepository.findById('1');
    expect(deletedPrompt).toBeNull();
  });
});