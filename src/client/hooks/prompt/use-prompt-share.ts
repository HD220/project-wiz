import { promptUIToData } from "../../types/prompt";
import type { PromptUI } from "../../types/prompt";
import { PromptRepository } from "../../../core/infrastructure/db/promptRepository";
import {
  exportPromptsWithChecksum,
  validateImportedPackage,
  generateShareToken,
} from "../../../core/application/services/prompt-share-service";

export function usePromptShare() {
  function exportPrompts(prompts: PromptUI[]): string {
    const promptDataList = prompts.map((p) => promptUIToData(p));
    const pkg = exportPromptsWithChecksum(promptDataList);
    return JSON.stringify(pkg);
  }

  async function importPrompts(json: string): Promise<void> {
    let pkg;
    try {
      pkg = JSON.parse(json);
    } catch {
      throw new Error("Invalid JSON file.");
    }

    try {
      validateImportedPackage(pkg);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Package validation failed.");
    }

    try {
      await PromptRepository.importPrompts(pkg.prompts);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Error importing prompts.");
    }
  }

  function generateShareLink(): string {
    return generateShareToken();
  }

  return {
    exportPrompts,
    importPrompts,
    generateShareLink,
  };
}