import { IPromptRepository, PromptData } from "../types/prompt-repository";

export class PromptService {
  private repository: IPromptRepository;

  constructor(repository: IPromptRepository) {
    this.repository = repository;
  }

  async listPrompts(): Promise<PromptData[]> {
    try {
      return await this.repository.listPrompts();
    } catch (error: any) {
      throw new Error(
        `Failed to list prompts: ${error?.message ?? String(error)}`
      );
    }
  }

  async createPrompt(prompt: PromptData): Promise<void> {
    this.validatePromptData(prompt);
    try {
      return await this.repository.createPrompt(prompt);
    } catch (error: any) {
      throw new Error(
        `Failed to create prompt (id: ${prompt.id}): ${error?.message ?? String(error)}`
      );
    }
  }

  async updatePrompt(id: string, updates: Partial<PromptData>): Promise<void> {
    this.validateId(id);
    this.validateUpdates(updates);
    try {
      return await this.repository.updatePrompt(id, updates);
    } catch (error: any) {
      throw new Error(
        `Failed to update prompt (id: ${id}): ${error?.message ?? String(error)}`
      );
    }
  }

  async deletePrompt(id: string): Promise<void> {
    this.validateId(id);
    try {
      return await this.repository.deletePrompt(id);
    } catch (error: any) {
      throw new Error(
        `Failed to delete prompt (id: ${id}): ${error?.message ?? String(error)}`
      );
    }
  }

  async restoreDefaultPrompts(): Promise<void> {
    try {
      return await this.repository.restoreDefaultPrompts();
    } catch (error: any) {
      throw new Error(
        `Failed to restore default prompts: ${error?.message ?? String(error)}`
      );
    }
  }

  private validateId(id: unknown): void {
    if (typeof id !== "string" || id.trim() === "") {
      throw new Error("Parameter 'id' is required and must be a non-empty string.");
    }
  }

  private validatePromptData(prompt: unknown): void {
    if (typeof prompt !== "object" || prompt === null) {
      throw new Error("Parameter 'prompt' is required and must be a valid object.");
    }
    const p = prompt as PromptData;
    if (typeof p.id !== "string" || p.id.trim() === "") {
      throw new Error("Prompt 'id' is required and must be a non-empty string.");
    }
    if (typeof p.name !== "string" || p.name.trim() === "") {
      throw new Error("Prompt 'name' is required and must be a non-empty string.");
    }
    if (typeof p.content !== "string" || p.content.trim() === "") {
      throw new Error("Prompt 'content' is required and must be a non-empty string.");
    }
    if (!Array.isArray(p.variables)) {
      throw new Error("Prompt 'variables' is required and must be an array.");
    }
  }

  private validateUpdates(updates: unknown): void {
    if (typeof updates !== "object" || updates === null) {
      throw new Error("Parameter 'updates' is required and must be a valid object.");
    }
    const u = updates as Partial<PromptData>;
    if (
      !("id" in u) &&
      !("name" in u) &&
      !("content" in u) &&
      !("variables" in u)
    ) {
      throw new Error(
        "Parameter 'updates' must have at least one property to update (id, name, content, variables)."
      );
    }
  }
}