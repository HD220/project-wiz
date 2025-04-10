import { db } from "./client";
import { prompts, variables } from "./schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

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
  static async createPrompt(data: PromptData) {
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

  static async updatePrompt(id: string, updatedData: Partial<PromptData>) {
    const existing = await db.select().from(prompts).where(eq(prompts.id, id));
    if (existing.length === 0) {
      throw new Error("Prompt não encontrado.");
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

  static async deletePrompt(id: string) {
    await db.delete(variables).where(eq(variables.promptId, id));
    await db.delete(prompts).where(eq(prompts.id, id));
  }

  static async getPrompt(id: string) {
    const prompt = await db.select().from(prompts).where(eq(prompts.id, id));
    if (prompt.length === 0) return null;

    const vars = await db.select().from(variables).where(eq(variables.promptId, id));

    return {
      ...prompt[0],
      variables: vars,
    };
  }

  static async listPrompts(filter?: { name?: string }) {
    let query = db.select().from(prompts);
    if (filter?.name) {
      // @ts-expect-error Drizzle bug
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

  static async restoreDefaultPrompts() {
    await db.delete(variables).where(
      inArray(
        variables.promptId,
        db.select({ id: prompts.id }).from(prompts).where(eq(prompts.isDefault, 0))
      )
    );
    await db.delete(prompts).where(eq(prompts.isDefault, 0));
  }

  static async listPromptNames(): Promise<string[]> {
    const promptsList = await db.select({ name: prompts.name }).from(prompts);
    return promptsList.map((p) => p.name);
  }

  static async listPromptNamesExceptId(id: string): Promise<string[]> {
    const promptsList = await db
      .select({ name: prompts.name })
      .from(prompts)
      .where(sql`prompts.id != ${id}`);
    return promptsList.map((p) => p.name);
  }

  static async getPromptById(id: string): Promise<any | null> {
    const result = await db.select().from(prompts).where(eq(prompts.id, id));
    if (result.length === 0) return null;
    const vars = await db.select().from(variables).where(eq(variables.promptId, id));
    return {
      ...result[0],
      variables: vars,
    };
  }
}