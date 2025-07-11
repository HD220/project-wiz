import { Persona } from "../domain/entities/persona.entity";
import { PersonaRepository } from "../domain/repositories/persona.repository";
import { EventBus } from "@/main/kernel/event-bus";
import logger from "@/main/logger";

export class PersonaService {
  constructor(
    private readonly personaRepository: PersonaRepository,
    private readonly eventBus: EventBus,
  ) {}

  async createPersona(props: Omit<Persona, 'id' | 'createdAt' | 'updatedAt'>): Promise<Persona> {
    const persona = new Persona({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.personaRepository.save(persona);
    logger.info(`Persona created: ${persona.name}`);
    this.eventBus.publish('persona.created', persona);
    return persona;
  }

  async getPersonaById(id: string): Promise<Persona | null> {
    return this.personaRepository.findById(id);
  }

  async getPersonaByName(name: string): Promise<Persona | null> {
    return this.personaRepository.findByName(name);
  }

  async getAllPersonas(): Promise<Persona[]> {
    return this.personaRepository.findAll();
  }

  async getPersonasByRole(role: string): Promise<Persona[]> {
    return this.personaRepository.findByRole(role);
  }

  async getBuiltInPersona(): Promise<Persona | null> {
    return this.personaRepository.findBuiltInPersona();
  }

  async updatePersona(id: string, updates: Partial<Persona>): Promise<Persona> {
    const persona = await this.personaRepository.findById(id);
    if (!persona) {
      throw new Error(`Persona with ID ${id} not found.`);
    }

    // Apply updates
    Object.assign(persona.props, updates);
    persona.touch(); // Update updatedAt timestamp

    await this.personaRepository.update(persona);
    logger.info(`Persona updated: ${persona.name}`);
    this.eventBus.publish('persona.updated', persona);
    return persona;
  }

  async deletePersona(id: string): Promise<void> {
    await this.personaRepository.delete(id);
    logger.info(`Persona deleted: ${id}`);
    this.eventBus.publish('persona.deleted', { id });
  }

  async updatePersonaStatus(id: string, status: Persona['props']['status'], taskId?: string, worktreePath?: string): Promise<void> {
    const persona = await this.personaRepository.findById(id);
    if (!persona) {
      throw new Error(`Persona with ID ${id} not found.`);
    }

    persona.updateStatus(status);
    if (taskId) {
      persona.assignTask(taskId, worktreePath || '');
    } else {
      persona.completeTask();
    }

    await this.personaRepository.update(persona);
    logger.info(`Persona ${persona.name} status updated to ${status}`);
    this.eventBus.publish('persona.statusUpdated', { id, status, taskId });
  }
}