import { z } from "zod";
import { createEntityCrud } from "../../../infrastructure/crud/entity-crud-factory";
import { agents } from "../../../persistence/schemas/agents.schema";
import { createAgentFromDbData } from "./agent.mapper";

// Schemas para validação
const CreateAgentSchema = z.object({
  name: z.string().min(2).max(100),
  role: z.string().min(2).max(100),
  goal: z.string().min(10),
  backstory: z.string().min(10),
  llmProviderId: z.string(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(100).max(4000).default(1000),
  isActive: z.boolean().default(false),
  isDefault: z.boolean().default(false),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
});

const UpdateAgentSchema = CreateAgentSchema.partial().extend({
  updatedAt: z.string().default(() => new Date().toISOString()),
});

type CreateAgentInput = z.infer<typeof CreateAgentSchema>;
type UpdateAgentInput = z.infer<typeof UpdateAgentSchema>;

// Criar CRUD operations usando a factory
const agentCrud = createEntityCrud({
  table: agents,
  entityName: "Agent",
  createSchema: CreateAgentSchema,
  updateSchema: UpdateAgentSchema,
  entityFactory: createAgentFromDbData,
});

// Funções públicas simples que delegam para a factory
export const createAgent = agentCrud.create;
export const findAgentById = agentCrud.findById;
export const findAllAgents = agentCrud.findAll;
export const updateAgent = agentCrud.update;
export const deleteAgent = agentCrud.delete;

// Exportar tipos para uso externo
export type { CreateAgentInput, UpdateAgentInput };
