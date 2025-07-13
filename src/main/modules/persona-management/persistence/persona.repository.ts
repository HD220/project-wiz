import { eq, and, inArray, notInArray } from "drizzle-orm";
import { db } from "../../../persistence/db";
import {
  personasTable,
  projectPersonasTable,
  type PersonaSchema,
  type PersonaInsert,
  type ProjectPersonaSchema,
  type ProjectPersonaInsert,
} from "./schema";
import type {
  PersonaFilterDto,
  ProjectPersonaFilterDto,
} from "../../../../shared/types/persona.types";

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

    // Filter by project if specified
    if (filter?.projectId) {
      const projectPersonas = await db
        .select({ personaId: projectPersonasTable.personaId })
        .from(projectPersonasTable)
        .where(eq(projectPersonasTable.projectId, filter.projectId));
      
      const personaIds = projectPersonas.map(pp => pp.personaId);
      
      if (personaIds.length > 0) {
        conditions.push(inArray(personasTable.id, personaIds));
      } else {
        // No personas for this project, return empty array
        return [];
      }
    }

    if (conditions.length > 0) {
      return await query.where(and(...conditions));
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

  // Project-Persona relationship methods
  async addPersonaToProject(
    data: Omit<ProjectPersonaInsert, "addedAt">,
  ): Promise<ProjectPersonaSchema> {
    const [saved] = await db
      .insert(projectPersonasTable)
      .values({
        ...data,
        addedAt: new Date(),
      })
      .returning();

    return saved;
  }

  async removePersonaFromProject(
    projectId: string,
    personaId: string,
  ): Promise<void> {
    await db
      .delete(projectPersonasTable)
      .where(
        and(
          eq(projectPersonasTable.projectId, projectId),
          eq(projectPersonasTable.personaId, personaId),
        ),
      );
  }

  async findProjectPersonas(
    filter?: ProjectPersonaFilterDto,
  ): Promise<ProjectPersonaSchema[]> {
    let query = db.select().from(projectPersonasTable);

    const conditions = [];

    if (filter?.projectId) {
      conditions.push(eq(projectPersonasTable.projectId, filter.projectId));
    }

    if (filter?.personaId) {
      conditions.push(eq(projectPersonasTable.personaId, filter.personaId));
    }

    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }

    return await query;
  }

  async isPersonaInProject(
    projectId: string,
    personaId: string,
  ): Promise<boolean> {
    const [result] = await db
      .select()
      .from(projectPersonasTable)
      .where(
        and(
          eq(projectPersonasTable.projectId, projectId),
          eq(projectPersonasTable.personaId, personaId),
        ),
      )
      .limit(1);

    return !!result;
  }

  async findPersonasNotInProject(projectId: string): Promise<PersonaSchema[]> {
    const projectPersonas = await db
      .select({ personaId: projectPersonasTable.personaId })
      .from(projectPersonasTable)
      .where(eq(projectPersonasTable.projectId, projectId));

    const personaIdsInProject = projectPersonas.map(pp => pp.personaId);

    if (personaIdsInProject.length === 0) {
      // If no personas in project, return all active personas
      return this.findActivePersonas();
    }

    return await db
      .select()
      .from(personasTable)
      .where(
        and(
          eq(personasTable.isActive, true),
          notInArray(personasTable.id, personaIdsInProject),
        ),
      );
  }
}
