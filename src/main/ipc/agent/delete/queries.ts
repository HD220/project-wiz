import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  agentsTable, 
  type SelectAgent 
} from "@/main/database/schemas/agent.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const DeleteAgentInputSchema = z.object({
  id: z.string().min(1, "Agent ID is required"),
  deletedBy: z.string().min(1, "Deleted by user ID is required"),
});

// Output validation schema (retorna sucesso)
export const DeleteAgentOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type DeleteAgentInput = z.infer<typeof DeleteAgentInputSchema>;
export type DeleteAgentOutput = z.infer<typeof DeleteAgentOutputSchema>;

export async function deleteAgent(input: DeleteAgentInput): Promise<DeleteAgentOutput> {
  const db = getDatabase();
  
  const validatedInput = DeleteAgentInputSchema.parse(input);
  
  // Usar transação síncrona conforme o padrão do AgentService original
  const success = db.transaction((tx) => {
    // 1. Verificar se o agent existe e está ativo
    const agents = tx
      .select()
      .from(agentsTable)
      .where(and(eq(agentsTable.id, validatedInput.id), eq(agentsTable.isActive, true)))
      .limit(1)
      .all();

    const agent = agents[0];
    if (!agent) {
      throw new Error("Agent not found or already inactive");
    }

    // 2. Soft delete do agent
    tx.update(agentsTable)
      .set({
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedBy: validatedInput.deletedBy,
        updatedAt: new Date(),
      })
      .where(eq(agentsTable.id, validatedInput.id))
      .run();

    return true;
  });

  return DeleteAgentOutputSchema.parse({
    success,
    message: "Agent deactivated successfully"
  });
}