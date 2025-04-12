import { db } from "../client";
import { prompts, variables } from "../schema";
import { eq, inArray, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import type { PromptRepositoryPort, Prompt } from "../../../application/ports/PromptRepositoryPort";

/**
 * Implementação da infraestrutura do repositório de Prompts.
 * Esta classe implementa o contrato da aplicação (PromptRepositoryPort).
 * Métodos extras são específicos da infraestrutura e não fazem parte do contrato.
 */
export class PromptRepositoryImpl implements PromptRepositoryPort {
  async getAllPrompts(): Promise<Prompt[]> {
    const promptList = await db.select().from(prompts);
    const result: Prompt[] = [];
    for (const prompt of promptList) {
      const vars = await db.select().from(variables).where(eq(variables.promptId, prompt.id));
      result.push({
        text: prompt.content,
        parameters: vars.reduce((acc: any, v: any) => {
          acc[v.name] = {
            type: v.type,
            required: !!v.required,
            enum: v.options ?? undefined,
          };
          return acc;
        }, {}),
      });
    }
    return result;
  }

  async getPromptById(id: string): Promise<Prompt | null> {
    const result = await db.select().from(prompts).where(eq(prompts.id, id));
    if (result.length === 0) return null;
    const vars = await db.select().from(variables).where(eq(variables.promptId, id));
    return {
      text: result[0].content,
      parameters: vars.reduce((acc: any, v: any) => {
        acc[v.name] = {
          type: v.type,
          required: !!v.required,
          enum: v.options ?? undefined,
        };
        return acc;
      }, {}),
    };
  }

  async savePrompt(prompt: Prompt): Promise<void> {
    const promptId = uuidv4();
    const now = new Date();

    await db.insert(prompts).values({
      id: promptId,
      name: prompt.text.substring(0, 50),
      content: prompt.text,
      createdAt: now,
      updatedAt: now,
      version: 1,
      isDefault: 0,
      isShared: 0,
      sharedLink: null,
    });

    if (prompt.parameters) {
      for (const [name, param] of Object.entries(prompt.parameters)) {
        await db.insert(variables).values({
          id: uuidv4(),
          promptId,
          name,
          type: param.type,
          required: param.required ? 1 : 0,
          defaultValue: null,
          options: param.enum ?? null,
        });
      }
    }
  }

  async updatePrompt(id: string, prompt: Prompt): Promise<void> {
    const existing = await db.select().from(prompts).where(eq(prompts.id, id));
    if (existing.length === 0) {
      throw new Error("Prompt not found.");
    }

    const now = new Date();
    const newVersion = existing[0].version + 1;

    await db
      .update(prompts)
      .set({
        content: prompt.text,
        updatedAt: now,
        version: newVersion,
      })
      .where(eq(prompts.id, id));

    await db.delete(variables).where(eq(variables.promptId, id));

    if (prompt.parameters) {
      for (const [name, param] of Object.entries(prompt.parameters)) {
        await db.insert(variables).values({
          id: uuidv4(),
          promptId: id,
          name,
          type: param.type,
          required: param.required ? 1 : 0,
          defaultValue: null,
          options: param.enum ?? null,
        });
      }
    }
  }

  async deletePrompt(id: string): Promise<void> {
    await db.delete(variables).where(eq(variables.promptId, id));
    await db.delete(prompts).where(eq(prompts.id, id));
  }

  // Infrastructure-specific helper methods, not part of PromptRepositoryPort contract

  async importPrompts(data: any[]): Promise<void> {
    for (const prompt of data) {
      const existing = await db.select().from(prompts).where(eq(prompts.name, prompt.name));
      if (existing.length > 0) {
        await this.updatePrompt(existing[0].id, prompt);
      } else {
        await this.savePrompt(prompt);
      }
    }
  }

  async exportPrompts(ids?: string[]): Promise<any[]> {
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

  async listPromptNames(): Promise<string[]> {
    const promptsList = await db.select({ name: prompts.name }).from(prompts);
    return promptsList.map((p) => p.name);
  }

  async listPromptNamesExceptId(id: string): Promise<string[]> {
    const promptsList = await db
      .select({ name: prompts.name })
      .from(prompts)
      .where(sql`prompts.id != ${id}`);
    return promptsList.map((p) => p.name);
  }

  async restoreDefaultPrompts(): Promise<void> {
    await db.delete(variables).where(
      inArray(
        variables.promptId,
        db.select({ id: prompts.id }).from(prompts).where(eq(prompts.isDefault, 0))
      )
    );
    await db.delete(prompts).where(eq(prompts.isDefault, 0));
  }
}