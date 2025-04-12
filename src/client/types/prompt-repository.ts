export interface PromptVariableData {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "enum";
  required: boolean;
  defaultValue?: string | number | boolean | null;
}

export interface PromptData {
  id: string;
  name: string;
  content: string;
  variables: PromptVariableData[];
}

export interface IPromptRepository {
  listPrompts(): Promise<PromptData[]>;
  createPrompt(prompt: PromptData): Promise<void>;
  updatePrompt(id: string, updates: Partial<PromptData>): Promise<void>;
  deletePrompt(id: string): Promise<void>;
  restoreDefaultPrompts(): Promise<void>;
}