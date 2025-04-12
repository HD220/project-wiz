import type { PromptUI } from "../../types/prompt";
import type { PromptData } from "../../types/prompt-repository";
import type { ExportedPromptPackage } from "../../../core/application/services/prompt-share-service";

/**
 * Interface para serviço de exportação, validação e geração de token de prompts.
 */
export interface IPromptShareService {
  exportPromptsWithChecksum(prompts: PromptData[]): ExportedPromptPackage;
  validateImportedPackage(pkg: ExportedPromptPackage): { success: true } | { success: false; error: string };
  generateShareToken(): string;
}

/**
 * Interface para serviço de importação de prompts.
 */
export interface IPromptImportService {
  importPrompts(prompts: PromptData[]): Promise<{ success: true } | { success: false; error: string }>;
}

/**
 * Função utilitária para converter PromptUI para PromptData.
 */
function promptUIToData(ui: PromptUI): PromptData {
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

export interface UsePromptShareResult {
  exportPrompts: (prompts: PromptUI[]) => { success: true; data: string } | { success: false; error: string };
  importPrompts: (json: string) => Promise<{ success: true } | { success: false; error: string }>;
  generateShareLink: () => string;
}

/**
 * Hook para compartilhamento de prompts, com injeção de dependências para facilitar testes.
 */
export function usePromptShare(
  shareService: IPromptShareService,
  importService: IPromptImportService
): UsePromptShareResult {
  function exportPrompts(prompts: PromptUI[]): { success: true; data: string } | { success: false; error: string } {
    try {
      const promptDataList = prompts.map(promptUIToData);
      const pkg = shareService.exportPromptsWithChecksum(promptDataList);
      return { success: true, data: JSON.stringify(pkg) };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Export error" };
    }
  }

  async function importPrompts(json: string): Promise<{ success: true } | { success: false; error: string }> {
    let pkg: ExportedPromptPackage;
    try {
      pkg = JSON.parse(json);
    } catch {
      return { success: false, error: "Invalid JSON file." };
    }

    const validation = shareService.validateImportedPackage(pkg);
    if (!validation.success) {
      return { success: false, error: validation.error };
    }

    const result = await importService.importPrompts(pkg.prompts);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true };
  }

  function generateShareLink(): string {
    return shareService.generateShareToken();
  }

  return {
    exportPrompts,
    importPrompts,
    generateShareLink,
  };
}