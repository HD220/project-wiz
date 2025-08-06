import { z } from "zod";
import { findAgent } from "@/main/ipc/agent/queries";
import { AgentSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";
import { createDatabaseConnection } from "@/shared/config/database";
import { usersTable } from "@/main/schemas/user.schema";
import { agentsTable } from "@/main/schemas/agent.schema";
import { eq, and } from "drizzle-orm";

const logger = getLogger("agent.update.invoke");

const UpdateAgentInputSchema = AgentSchema.pick({
  id: true,
  name: true,
  role: true,
  backstory: true,
  goal: true,
  providerId: true,
  modelConfig: true,
  status: true,
  avatar: true
}).partial().extend({
  id: z.string() // id is required for update
});

const UpdateAgentOutputSchema = AgentSchema;

const handler = createIPCHandler({
  inputSchema: UpdateAgentInputSchema,
  outputSchema: UpdateAgentOutputSchema,
  handler: async (input) => {
    logger.debug("Updating agent", { agentId: input.id });

    const currentUser = requireAuth();
    
    // Validar se existe e se o user tem autorização
    const existingAgent = await findAgent(input.id, currentUser.id);

    if (!existingAgent) {
      throw new Error("Agent not found for current user session");
    }
    
    // Update both user and agent tables
    const { getDatabase } = createDatabaseConnection(true);
    const db = getDatabase();
    
    // Separate fields for each table
    const userFields: Record<string, any> = {};
    const agentFields: Record<string, any> = {};
    
    // User fields
    if (input.name !== undefined) userFields['name'] = input.name;
    if (input.avatar !== undefined) userFields['avatar'] = input.avatar;
    
    // Agent fields  
    if (input.role !== undefined) agentFields['role'] = input.role;
    if (input.backstory !== undefined) agentFields['backstory'] = input.backstory;
    if (input.goal !== undefined) agentFields['goal'] = input.goal;
    if (input.providerId !== undefined) agentFields['providerId'] = input.providerId;
    if (input.modelConfig !== undefined) agentFields['modelConfig'] = JSON.stringify(input.modelConfig);
    if (input.status !== undefined) agentFields['status'] = input.status;
    
    // Update user table if there are user fields
    if (Object.keys(userFields).length > 0) {
      await db
        .update(usersTable)
        .set(userFields)
        .where(eq(usersTable.id, input.id));
    }
    
    // Update agent table if there are agent fields
    if (Object.keys(agentFields).length > 0) {
      await db
        .update(agentsTable)
        .set(agentFields)
        .where(and(
          eq(agentsTable.id, input.id),
          eq(agentsTable.ownerId, existingAgent.ownerId)
        ));
    }
    
    // Get updated data with JOIN
    const dbAgent = await findAgent(input.id, currentUser.id);
    
    if (!dbAgent) {
      throw new Error("Failed to retrieve updated agent");
    }

    // Mapeamento completo (dados já vem do JOIN)
    const apiAgent = {
      // Identity fields (users)
      id: dbAgent.id,
      name: dbAgent.name,
      avatar: dbAgent.avatar,
      type: dbAgent.type,
      
      // State management (users)
      isActive: dbAgent.isActive,
      deactivatedAt: dbAgent.deactivatedAt ? new Date(dbAgent.deactivatedAt) : null,
      deactivatedBy: dbAgent.deactivatedBy,
      
      // Timestamps (users)
      createdAt: new Date(dbAgent.createdAt),
      updatedAt: new Date(dbAgent.updatedAt),
      
      // Agent-specific fields (agents)
      ownerId: dbAgent.ownerId,
      role: dbAgent.role,
      backstory: dbAgent.backstory,
      goal: dbAgent.goal,
      providerId: dbAgent.providerId,
      modelConfig: JSON.parse(dbAgent.modelConfig),
      status: dbAgent.status,
    };
    
    logger.debug("Agent updated", { 
      agentId: apiAgent.id, 
      agentName: apiAgent.name,
      status: apiAgent.status
    });
    
    // Emit specific event for update
    eventBus.emit("agent:updated", { agentId: apiAgent.id });
    
    return apiAgent;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Agent {
      update: InferHandler<typeof handler>
    }
  }
}