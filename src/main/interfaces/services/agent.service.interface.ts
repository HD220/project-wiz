import type { Agent } from "../../modules/agent-management/domain/agent.entity";
import type {
  CreateAgentDto,
  UpdateAgentDto,
  AgentFilterDto,
} from "../../../shared/types/agent.types";

export interface IAgentService {
  createAgent(data: CreateAgentDto): Promise<Agent>;
  getAgentById(id: string): Promise<Agent | null>;
  getAgentByName(name: string): Promise<Agent | null>;
  getAllAgents(filter?: AgentFilterDto): Promise<Agent[]>;
  updateAgent(id: string, data: UpdateAgentDto): Promise<Agent>;
  deleteAgent(id: string): Promise<void>;
  activateAgent(id: string): Promise<void>;
  deactivateAgent(id: string): Promise<void>;
  setDefaultAgent(id: string): Promise<void>;
  getDefaultAgent(): Promise<Agent | null>;
  getAgentsByLlmProvider(llmProviderId: string): Promise<Agent[]>;
}
