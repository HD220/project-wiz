import { PersonaRepository } from "../persistence/persona.repository";
import { Persona } from "../domain/persona.entity";
import { PersonaMapper } from "../persona.mapper";
import type {
  CreatePersonaDto,
  UpdatePersonaDto,
  PersonaFilterDto,
  AddPersonaToProjectDto,
  RemovePersonaFromProjectDto,
  ProjectPersonaFilterDto,
} from "../../../../shared/types/persona.types";

export class PersonaService {
  constructor(
    private repository: PersonaRepository,
    private mapper: PersonaMapper,
  ) {}

  async createPersona(data: CreatePersonaDto): Promise<Persona> {
    // Validate input data
    if (!Persona.validateNome(data.nome)) {
      throw new Error("Nome deve ter entre 2 e 100 caracteres");
    }

    if (!Persona.validatePapel(data.papel)) {
      throw new Error("Papel deve ter entre 2 e 200 caracteres");
    }

    if (!Persona.validateGoal(data.goal)) {
      throw new Error("Objetivo deve ter entre 10 e 1000 caracteres");
    }

    if (!Persona.validateBackstory(data.backstory)) {
      throw new Error("Background deve ter entre 10 e 2000 caracteres");
    }

    // Check for duplicate names
    const existing = await this.repository.findMany({
      nome: data.nome,
    });

    if (existing.length > 0) {
      throw new Error("Já existe uma persona com este nome");
    }

    const saved = await this.repository.save({
      nome: data.nome,
      papel: data.papel,
      goal: data.goal,
      backstory: data.backstory,
      llmProviderId: data.llmProviderId,
      isActive: data.isActive ?? true,
    });

    return this.mapper.toDomain(saved);
  }

  async listPersonas(filter?: PersonaFilterDto): Promise<Persona[]> {
    console.log('[PersonaService] Listing personas with filter:', filter);
    const schemas = await this.repository.findMany(filter);
    console.log('[PersonaService] Found schemas:', schemas.length, schemas.map(s => ({ id: s.id, nome: s.nome })));
    return schemas.map((schema) => this.mapper.toDomain(schema));
  }

  async getPersonaById(id: string): Promise<Persona | null> {
    const schema = await this.repository.findById(id);
    return schema ? this.mapper.toDomain(schema) : null;
  }

  async updatePersona(data: UpdatePersonaDto): Promise<Persona> {
    const existing = await this.repository.findById(data.id);
    if (!existing) {
      throw new Error("Persona não encontrada");
    }

    // Validate updated data
    if (data.nome && !Persona.validateNome(data.nome)) {
      throw new Error("Nome deve ter entre 2 e 100 caracteres");
    }

    if (data.papel && !Persona.validatePapel(data.papel)) {
      throw new Error("Papel deve ter entre 2 e 200 caracteres");
    }

    if (data.goal && !Persona.validateGoal(data.goal)) {
      throw new Error("Objetivo deve ter entre 10 e 1000 caracteres");
    }

    if (data.backstory && !Persona.validateBackstory(data.backstory)) {
      throw new Error("Background deve ter entre 10 e 2000 caracteres");
    }

    // Check for duplicate names (only if name is being changed)
    if (data.nome && data.nome !== existing.nome) {
      const duplicates = await this.repository.findMany({
        nome: data.nome,
      });

      if (duplicates.length > 0) {
        throw new Error("Já existe uma persona com este nome");
      }
    }

    const updated = await this.repository.update(data.id, data);
    return this.mapper.toDomain(updated);
  }

  async deletePersona(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Persona não encontrada");
    }

    await this.repository.delete(id);
  }

  async getActivePersonas(): Promise<Persona[]> {
    console.log('[PersonaService] Getting active personas...');
    const schemas = await this.repository.findActivePersonas();
    console.log('[PersonaService] Found schemas:', schemas.length);
    const result = schemas.map((schema) => this.mapper.toDomain(schema));
    console.log('[PersonaService] Mapped to domain:', result.length);
    return result;
  }

  async togglePersonaStatus(id: string): Promise<Persona> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Persona não encontrada");
    }

    const updated = await this.repository.update(id, {
      isActive: !existing.isActive,
    });

    return this.mapper.toDomain(updated);
  }

  // Project-Persona relationship methods
  async addPersonaToProject(data: AddPersonaToProjectDto): Promise<void> {
    // Validate that persona exists and is active
    const persona = await this.repository.findById(data.personaId);
    if (!persona) {
      throw new Error("Persona não encontrada");
    }

    if (!persona.isActive) {
      throw new Error("Não é possível adicionar uma persona inativa ao projeto");
    }

    // Check if persona is already in the project
    const isAlreadyInProject = await this.repository.isPersonaInProject(
      data.projectId,
      data.personaId,
    );

    if (isAlreadyInProject) {
      throw new Error("Esta persona já está no projeto");
    }

    await this.repository.addPersonaToProject({
      projectId: data.projectId,
      personaId: data.personaId,
      addedBy: data.addedBy,
    });
  }

  async removePersonaFromProject(data: RemovePersonaFromProjectDto): Promise<void> {
    // Check if persona is in the project
    const isInProject = await this.repository.isPersonaInProject(
      data.projectId,
      data.personaId,
    );

    if (!isInProject) {
      throw new Error("Esta persona não está no projeto");
    }

    await this.repository.removePersonaFromProject(data.projectId, data.personaId);
  }

  async getProjectPersonas(projectId: string): Promise<Persona[]> {
    const schemas = await this.repository.findMany({ projectId });
    return schemas.map((schema) => this.mapper.toDomain(schema));
  }

  async getPersonasNotInProject(projectId: string): Promise<Persona[]> {
    const schemas = await this.repository.findPersonasNotInProject(projectId);
    return schemas.map((schema) => this.mapper.toDomain(schema));
  }

  async isPersonaInProject(projectId: string, personaId: string): Promise<boolean> {
    return this.repository.isPersonaInProject(projectId, personaId);
  }
}
