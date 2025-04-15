import type { Prompt } from '../ports/PromptRepositoryPort';

export interface ValidationStrategy {
  validate(prompt: Prompt): boolean;
}

export class RequiredFieldValidation implements ValidationStrategy {
  constructor(private field: string) {}

  validate(prompt: Prompt): boolean {
    return prompt.parameters && prompt.parameters[this.field] !== undefined;
  }
}

export class MaxLengthValidation implements ValidationStrategy {
  constructor(private field: string, private maxLength: number) {}

  validate(prompt: Prompt): boolean {
    return prompt.text.length <= this.maxLength;
  }
}

export class MinLengthValidation implements ValidationStrategy {
  constructor(private field: string, private minLength: number) {}

  validate(prompt: Prompt): boolean {
    return prompt.text.length >= this.minLength;
  }
}