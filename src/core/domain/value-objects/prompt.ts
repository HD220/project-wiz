export interface PromptParameter {
  type: 'string' | 'number' | 'boolean' | 'date' | 'enum';
  required?: boolean;
  enum?: string[];
}

export interface PromptParameters {
  [name: string]: PromptParameter;
}

export interface PromptValues {
  [name: string]: string | number | boolean | Date | undefined;
}

export interface Prompt {
  text: string;
  parameters?: PromptParameters;
}