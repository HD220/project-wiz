import { createEntityQueryHooks } from "../../../hooks/use-query-factory.hook";
import { agentService } from "../services/agent.service";

// Criação automática dos hooks usando o factory
const agentQueryHooks = createEntityQueryHooks("agent", agentService);

// Exportação dos hooks com nomes específicos para agents
export const useAgentsQuery = agentQueryHooks.useListQuery;
export const useAgentQuery = agentQueryHooks.useByIdQuery;
export const useAgentByNameQuery = agentQueryHooks.useByNameQuery!;
export const useActiveAgentsQuery = agentQueryHooks.useActiveQuery!;
