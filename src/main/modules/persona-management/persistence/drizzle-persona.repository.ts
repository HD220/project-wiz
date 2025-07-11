import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eq, desc } from "drizzle-orm";
import { Persona } from "../domain/entities/persona.entity";
import { PersonaRepository } from "../domain/repositories/persona.repository";
import { personas } from "../persistence/schema";

export class DrizzlePersonaRepository implements PersonaRepository {
  constructor(private readonly db: BetterSQLite3Database<any>) {}

  async save(persona: Persona): Promise<void> {
    const personaData = {
      id: persona.id,
      name: persona.props.name,
      description: persona.props.description || null,
      llmModel: persona.props.llmModel,
      llmTemperature: persona.props.llmTemperature,
      tools: JSON.stringify(persona.props.tools),
      role: persona.props.role,
      profile: persona.props.profile || null,
      backstory: persona.props.backstory || null,
      objective: persona.props.objective || null,
      systemPrompt: persona.props.systemPrompt,
      isBuiltIn: persona.props.isBuiltIn ? 1 : 0,
      status: persona.props.status,
      currentTaskId: persona.props.currentTaskId || null,
      worktreePath: persona.props.worktreePath || null,
      maxConcurrentTasks: persona.props.maxConcurrentTasks,
      capabilities: JSON.stringify(persona.props.capabilities),
    };

    await this.db.insert(personas).values(personaData).onConflictDoUpdate({
      target: personas.id,
      set: personaData,
    });
  }

  async findById(id: string): Promise<Persona | null> {
    const [result] = await this.db
      .select()
      .from(personas)
      .where(eq(personas.id, id))
      .limit(1);

    return result ? this.mapToDomainEntity(result) : null;
  }

  async findByName(name: string): Promise<Persona | null> {
    const [result] = await this.db
      .select()
      .from(personas)
      .where(eq(personas.name, name))
      .limit(1);

    return result ? this.mapToDomainEntity(result) : null;
  }

  async findAll(): Promise<Persona[]> {
    const results = await this.db
      .select()
      .from(personas)
      .orderBy(desc(personas.name));

    return results.map(this.mapToDomainEntity);
  }

  async findByRole(role: string): Promise<Persona[]> {
    const results = await this.db
      .select()
      .from(personas)
      .where(eq(personas.role, role))
      .orderBy(desc(personas.name));

    return results.map(this.mapToDomainEntity);
  }

  async findBuiltInPersona(): Promise<Persona | null> {
    const [result] = await this.db
      .select()
      .from(personas)
      .where(eq(personas.isBuiltIn, 1))
      .limit(1);

    return result ? this.mapToDomainEntity(result) : null;
  }

  async update(persona: Persona): Promise<void> {
    await this.save(persona); // Reutiliza o método save que já faz upsert
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(personas).where(eq(personas.id, id));
  }

  private mapToDomainEntity(row: any): Persona {
    return new Persona(
      {
        name: row.name,
        description: row.description || undefined,
        llmModel: row.llmModel,
        llmTemperature: row.llmTemperature,
        tools: JSON.parse(row.tools || "[]"),
        role: row.role,
        profile: row.profile || undefined,
        backstory: row.backstory || undefined,
        objective: row.objective || undefined,
        systemPrompt: row.systemPrompt,
        isBuiltIn: row.isBuiltIn === 1,
        status: row.status,
        currentTaskId: row.currentTaskId || undefined,
        worktreePath: row.worktreePath || undefined,
        maxConcurrentTasks: row.maxConcurrentTasks,
        capabilities: JSON.parse(row.capabilities || "[]"),
      },
      row.id,
    );
  }
}