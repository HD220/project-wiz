export interface PromptValidationConfig {
  maxPrompts: number;
  maxContentLength: number;
  maxVariables: number;
  forbiddenWords: string[];
}

export interface VariableData {
  id?: string;
  name: string;
  type: "string" | "number" | "boolean" | "date" | "enum";
  required: boolean;
  defaultValue?: any;
  options?: any[];
}

export interface PromptData {
  id?: string;
  name: string;
  content: string;
  variables: VariableData[];
  isDefault?: boolean;
  isShared?: boolean;
  sharedLink?: string;
}