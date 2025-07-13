import { eq, and } from "drizzle-orm";
import { db } from "../../../persistence/db";
import {
  personasTable,
  type PersonaSchema,
  type PersonaInsert,
} from "./schema";
import type { PersonaFilterDto } from "../../../../shared/types/persona.types";

export class PersonaRepository {
  async save(
    data: Omit<PersonaInsert, "id" | "createdAt" | "updatedAt">,
  ): Promise<PersonaSchema> {
    const id = crypto.randomUUID();
    const now = new Date();

    const [saved] = await db
      .insert(personasTable)
      .values({
        id,
        ...data,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return saved;
  }

  async findById(id: string): Promise<PersonaSchema | null> {
    const [result] = await db
      .select()
      .from(personasTable)
      .where(eq(personasTable.id, id))
      .limit(1);

    return result || null;
  }

  async findMany(filter?: PersonaFilterDto): Promise<PersonaSchema[]> {
    let query = db.select().from(personasTable);

    const conditions = [];

    if (filter?.nome) {
      conditions.push(eq(personasTable.nome, filter.nome));
    }

    if (filter?.papel) {
      conditions.push(eq(personasTable.papel, filter.papel));
    }

    if (filter?.isActive !== undefined) {
      conditions.push(eq(personasTable.isActive, filter.isActive));
    }

    if (filter?.llmProviderId) {
      conditions.push(eq(personasTable.llmProviderId, filter.llmProviderId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  async update(
    id: string,
    data: Partial<Omit<PersonaInsert, "id" | "createdAt">>,
  ): Promise<PersonaSchema> {
    const [updated] = await db
      .update(personasTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(personasTable.id, id))
      .returning();

    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.delete(personasTable).where(eq(personasTable.id, id));
  }

  async findActivePersonas(): Promise<PersonaSchema[]> {
    console.log('[PersonaRepository] Finding active personas...');
    const result = await db
      .select()
      .from(personasTable)
      .where(eq(personasTable.isActive, true));
    console.log('[PersonaRepository] Found personas in DB:', result.length, result.map(p => ({ id: p.id, nome: p.nome, isActive: p.isActive })));
    return result;
  }
}
