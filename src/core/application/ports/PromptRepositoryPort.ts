export interface PromptRepositoryPort {
  getAllPrompts(): Promise<Prompt[]>;
  getPromptById(id: string): Promise<Prompt | null>;
  savePrompt(prompt: Prompt): Promise<void>;
  updatePrompt(id: string, prompt: Prompt): Promise<void>;
  deletePrompt(id: string): Promise<void>;
}

export interface Prompt {
  text: string;
  parameters?: {
    [name: string]: {
      type: 'string' | 'number' | 'boolean' | 'date' | 'enum';
      required?: boolean;
      enum?: string[];
    };
  };
}