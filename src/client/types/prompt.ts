import type { PromptData, VariableData } from "../../core/infrastructure/db/promptRepository";

export interface VariableUI {
  name: string;
  description?: string;
  defaultValue?: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'enum';
  required?: boolean;
  options?: string[];
}

export interface PromptUI {
  id: string;
  name: string;
  description?: string;
  content: string;
  variables: VariableUI[];
  createdAt: Date;
  updatedAt: Date;
  isShared?: boolean;
  sharedLink?: string;
}

export function promptDataToUI(data: PromptData): PromptUI {
  return {
    id: data.id ?? "",
    name: data.name,
    description: undefined,
    content: data.content,
    variables: data.variables.map((v) => ({
        name: v.name,
        description: undefined,
        defaultValue: v.defaultValue !== undefined && v.defaultValue !== null ? String(v.defaultValue) : undefined,
        type: v.type ?? 'string',
        required: v.required ?? false,
        options: v.options ?? [],
      })),
    createdAt: new Date(),
    updatedAt: new Date(),
    isShared: (data as any).isShared ?? false,
    sharedLink: (data as any).sharedLink ?? undefined,
  };
}

export function promptUIToData(ui: PromptUI): PromptData {
  return {
    id: ui.id,
    name: ui.name,
    content: ui.content,
    variables: ui.variables.map((v) => ({
      name: v.name,
      type: "string",
      required: false,
      defaultValue: v.defaultValue,
    })),
  };
}