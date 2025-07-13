import type { AgentSchema, CreateAgentSchema } from '../../persistence/schemas';
import type { AgentFilterDto } from '../../../shared/types/agent.types';

export interface IAgentRepository {
  save(data: CreateAgentSchema): Promise<AgentSchema>;
  findById(id: string): Promise<AgentSchema | null>;
  findByName(name: string): Promise<AgentSchema | null>;
  findAll(filter?: AgentFilterDto): Promise<AgentSchema[]>;
  update(id: string, data: Partial<CreateAgentSchema>): Promise<AgentSchema>;
  delete(id: string): Promise<void>;
  findByLlmProviderId(llmProviderId: string): Promise<AgentSchema[]>;
  setDefaultAgent(id: string): Promise<void>;
  getDefaultAgent(): Promise<AgentSchema | null>;
}