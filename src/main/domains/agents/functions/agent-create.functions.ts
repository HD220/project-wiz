import { z } from "zod";

import { getDatabase } from "../../../infrastructure/database";
import { getLogger } from "../../../infrastructure/logger";
import { agents } from "../../../persistence/schemas/agents.schema";

const logger = getLogger("agents.create");

const CreateAgentSchema = z.object({
  name: z.string().min(2).max(100),
  role: z.string().min(2).max(100),
  goal: z.string().min(10),
  backstory: z.string().min(10),
  llmProviderId: z.string(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(100).max(4000).default(1000),
});

type CreateAgentData = z.infer<typeof CreateAgentSchema>;

export async function createAgent(
  data: CreateAgentData,
): Promise<{ id: string }> {
  try {
    const validated = CreateAgentSchema.parse(data);

    const db = getDatabase();
    const result = await db
      .insert(agents)
      .values({
        name: validated.name,
        role: validated.role,
        goal: validated.goal,
        backstory: validated.backstory,
        llmProviderId: validated.llmProviderId,
        temperature: validated.temperature,
        maxTokens: validated.maxTokens,
      })
      .returning({ id: agents.id });

    logger.info(`Agent created: ${validated.name}`);
    return result[0];
  } catch (error) {
    logger.error("Failed to create agent", { error, data });
    throw error;
  }
}
