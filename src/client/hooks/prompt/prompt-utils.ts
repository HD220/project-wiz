import { PromptData, PromptVariableData } from "../../types/prompt-repository";
import type { PromptUI } from "../../types/prompt";

export function convertDbPromptToPromptData(dbPrompt: any): PromptData {
  return {
    id: dbPrompt.id,
    name: dbPrompt.name,
    content: dbPrompt.content,
    variables: (dbPrompt.variables ?? []).map((v: any): PromptVariableData => ({
      name: v.name,
      type:
        typeof v.type === "string" &&
        ["string", "number", "boolean", "date", "enum"].includes(v.type)
          ? v.type
          : "string",
      required: !!v.required,
      defaultValue: v.defaultValue,
    })),
  };
}

// Exemplo de função utilitária para tratar loading/erro em async actions
export async function withLoadingError<T>(
  setLoading: (v: boolean) => void,
  setError: (e: string | null) => void,
  fn: () => Promise<T>
): Promise<T | undefined> {
  setLoading(true);
  setError(null);
  try {
    return await fn();
  } catch (err) {
    setError(err instanceof Error ? err.message : String(err));
    return undefined;
  } finally {
    setLoading(false);
  }
}