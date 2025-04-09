import { db } from "./client";
import { prompts, variables } from "./schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { SettingsService } from "../../application/services/settings-service";

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

export class PromptRepository {
  /**
   * Cria um novo prompt com variáveis, validando restrições globais
   */
  static async createPrompt(data: PromptData) {
    if (data.name.length < 3 || data.name.length > 50) {
      throw new Error("O nome do prompt deve ter entre 3 e 50 caracteres.");
    }

    const existing = await db.select().from(prompts).where(eq(prompts.name, data.name));
    if (existing.length > 0) {
      throw new Error("Já existe um prompt com este nome.");
    }

    // Validações baseadas em configurações globais
    const [
      maxPrompts,
      maxContentLength,
      maxVariables,
      forbiddenWords,
    ] = await Promise.all([
      SettingsService.getMaxPromptsPerUser(),
      SettingsService.getMaxPromptContentLength(),
      SettingsService.getMaxVariablesPerPrompt(),
      SettingsService.getForbiddenWords(),
    ]);

    const totalPrompts = await db.select().from(prompts);
    if (totalPrompts.length >= maxPrompts) {
      throw new Error(`Limite máximo de ${maxPrompts} prompts atingido.`);
    }

    if (data.content.length > maxContentLength) {
      throw new Error(`O conteúdo do prompt excede o limite de ${maxContentLength} caracteres.`);
    }

    if (data.variables.length > maxVariables) {
      throw new Error(`Número máximo de variáveis por prompt é ${maxVariables}.`);
    }

    const contentLower = data.content.toLowerCase();
    for (const word of forbiddenWords) {
      if (contentLower.includes(word.toLowerCase())) {
        throw new Error(`O conteúdo do prompt contém uma palavra proibida: "${word}".`);
      }
    }

    const promptId = data.id ?? uuidv4();
    const now = new Date();

    await db.insert(prompts).values({
      id: promptId,
      name: data.name,
      content: data.content,
      createdAt: now,
      updatedAt: now,
      version: 1,
      isDefault: data.isDefault ? 1 : 0,
      isShared: data.isShared ? 1 : 0,
      sharedLink: data.sharedLink,
    });

    for (const variable of data.variables) {
      await db.insert(variables).values({
        id: variable.id ?? uuidv4(),
        promptId,
        name: variable.name,
        type: variable.type,
        required: variable.required ? 1 : 0,
        defaultValue: variable.defaultValue,
        options: variable.options,
      });
    }

    return promptId;
  }

  /**
   * Atualiza um prompt existente e suas variáveis, validando restrições globais
   */
  static async updatePrompt(id: string, updatedData: Partial<PromptData>) {
    const existing = await db.select().from(prompts).where(eq(prompts.id, id));
    if (existing.length === 0) {
      throw new Error("Prompt não encontrado.");
    }

    if (updatedData.name) {
      if (updatedData.name.length < 3 || updatedData.name.length > 50) {
        throw new Error("O nome do prompt deve ter entre 3 e 50 caracteres.");
      }
      const conflict = await db
        .select()
        .from(prompts)
        .where(and(eq(prompts.name, updatedData.name), sql`prompts.id != ${id}`));
      if (conflict.length > 0) {
        throw new Error("Já existe um prompt com este nome.");
      }
    }

    // Validações baseadas em configurações globais
    const [
      maxContentLength,
      maxVariables,
      forbiddenWords,
    ] = await Promise.all([
      SettingsService.getMaxPromptContentLength(),
      SettingsService.getMaxVariablesPerPrompt(),
      SettingsService.getForbiddenWords(),
    ]);

    if (updatedData.content && updatedData.content.length > maxContentLength) {
      throw new Error(`O conteúdo do prompt excede o limite de ${maxContentLength} caracteres.`);
    }

    if (updatedData.variables && updatedData.variables.length > maxVariables) {
      throw new Error(`Número máximo de variáveis por prompt é ${maxVariables}.`);
    }

    if (updatedData.content) {
      const contentLower = updatedData.content.toLowerCase();
      for (const word of forbiddenWords) {
        if (contentLower.includes(word.toLowerCase())) {
          throw new Error(`O conteúdo do prompt contém uma palavra proibida: "${word}".`);
        }
      }
    }

    const now = new Date();
    const newVersion = existing[0].version + 1;

    await db
      .update(prompts)
      .set({
        ...updatedData,
        updatedAt: now,
        version: newVersion,
        isDefault: updatedData.isDefault ? 1 : 0,
        isShared: updatedData.isShared ? 1 : 0,
      })
      .where(eq(prompts.id, id));

    if (updatedData.variables) {
      await db.delete(variables).where(eq(variables.promptId, id));
      for (const variable of updatedData.variables) {
        await db.insert(variables).values({
          id: variable.id ?? uuidv4(),
          promptId: id,
          name: variable.name,
          type: variable.type,
          required: variable.required ? 1 : 0,
          defaultValue: variable.defaultValue,
          options: variable.options,
        });
      }
    }
  }

  /**
   * Remove um prompt e suas variáveis
   */
  static async deletePrompt(id: string) {
    await db.delete(variables).where(eq(variables.promptId, id));
    await db.delete(prompts).where(eq(prompts.id, id));
  }

  /**
   * Obtém um prompt com suas variáveis
   */
  static async getPrompt(id: string) {
    const prompt = await db.select().from(prompts).where(eq(prompts.id, id));
    if (prompt.length === 0) return null;

    const vars = await db.select().from(variables).where(eq(variables.promptId, id));

    return {
      ...prompt[0],
      variables: vars,
    };
  }

  /**
   * Lista prompts, com filtro opcional por nome
   */
  static async listPrompts(filter?: { name?: string }) {
    let query = db.select().from(prompts);
    if (filter?.name) {
      // @ts-expect-error Erro de tipagem Drizzle, consulta está correta
      query = query.where(eq(prompts.name, filter.name));
    }
    const promptList = await query;
    const result = [];
    for (const prompt of promptList) {
      const vars = await db.select().from(variables).where(eq(variables.promptId, prompt.id));
      result.push({
        ...prompt,
        variables: vars,
      });
    }
    return result;
  }

  /**
   * Importa prompts substituindo existentes com mesmo nome
   */
  static async importPrompts(data: PromptData[]) {
    for (const prompt of data) {
      const existing = await db.select().from(prompts).where(eq(prompts.name, prompt.name));
      if (existing.length > 0) {
        await this.updatePrompt(existing[0].id, prompt);
      } else {
        await this.createPrompt(prompt);
      }
    }
  }

  /**
   * Exporta prompts, todos ou por IDs
   */
  static async exportPrompts(ids?: string[]) {
    let promptList;
    if (ids && ids.length > 0) {
      promptList = await db.select().from(prompts).where(inArray(prompts.id, ids));
    } else {
      promptList = await db.select().from(prompts);
    }

    const result = [];
    for (const prompt of promptList) {
      const vars = await db.select().from(variables).where(eq(variables.promptId, prompt.id));
      result.push({
        ...prompt,
        variables: vars,
      });
    }
    return result;
  }

  /**
   * Restaura prompts padrão removendo os personalizados
   */
  static async restoreDefaultPrompts() {
    await db.delete(variables).where(
      inArray(
        variables.promptId,
        db.select({ id: prompts.id }).from(prompts).where(eq(prompts.isDefault, 0))
      )
    );
    await db.delete(prompts).where(eq(prompts.isDefault, 0));
  }
}