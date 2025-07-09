import { eq } from "drizzle-orm";

import { db } from "@/main/persistence/db";
import { Persona } from "@/main/modules/persona-management/domain/persona.entity";
import { IPersonaRepository } from "@/main/modules/persona-management/domain/persona.repository";

import { personas } from "./schema";

export class DrizzlePersonaRepository implements IPersonaRepository {
  async save(persona: Persona): Promise<Persona> {
    try {
      await db.insert(personas).values({
        id: persona.id,
        name: persona.name,
        description: persona.description,
        llmModel: persona.llmConfig.model,
        llmTemperature: persona.llmConfig.temperature,
        tools: persona.tools,
      }).onConflictDoUpdate({
        target: personas.id,
        set: {
          name: persona.name,
          description: persona.description,
          llmModel: persona.llmConfig.model,
          llmTemperature: persona.llmConfig.temperature,
          tools: persona.tools,
        },
      });
      return persona;
    } catch (error: unknown) {
      console.error("Failed to save persona:", error);
      throw new Error(`Failed to save persona: ${(error as Error).message}`);
    }
  }

  async findById(id: string): Promise<Persona | undefined> {
    try {
      const result = await db.select().from(personas).where(eq(personas.id, id)).limit(1);
      if (result.length === 0) {
        return undefined;
      }
      const personaData = result[0];
      return new Persona({
        name: personaData.name,
        description: personaData.description,
        llmConfig: { model: personaData.llmModel, temperature: personaData.llmTemperature },
        tools: personaData.tools as string[],
      }, personaData.id);
    } catch (error: unknown) {
      console.error(`Failed to find persona by ID ${id}:`, error);
      throw new Error(`Failed to find persona by ID: ${(error as Error).message}`);
    }
  }

  async findAll(): Promise<Persona[]> {
    try {
      const results = await db.select().from(personas);
      return results.map(data => new Persona({
        name: data.name,
        description: data.description,
        llmConfig: { model: data.llmModel, temperature: data.llmTemperature },
        tools: data.tools as string[],
      }, data.id));
    } catch (error: unknown) {
      console.error("Failed to find all personas:", error);
      throw new Error(`Failed to find all personas: ${(error as Error).message}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db.delete(personas).where(eq(personas.id, id));
      return result.changes > 0;
    } catch (error: unknown) {
      console.error(`Failed to delete persona with ID ${id}:`, error);
      throw new Error(`Failed to delete persona: ${(error as Error).message}`);
    }
  }
}
