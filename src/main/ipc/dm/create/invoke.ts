import { z } from "zod";
import { createDM } from "./queries";
import { DMConversationSchema } from "@/shared/types";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("dm.create.invoke");

// Input schema - apenas campos de negócio (sem currentUserId que é adicionado automaticamente)
const CreateDMInputSchema = DMConversationSchema.pick({
  description: true,
}).extend({
  participantIds: z.array(z.string()).min(1, "At least one participant is required"),
});

// Output schema
const CreateDMOutputSchema = DMConversationSchema;

type CreateDMInput = z.infer<typeof CreateDMInputSchema>;
type CreateDMOutput = z.infer<typeof CreateDMOutputSchema>;

export default async function(input: CreateDMInput): Promise<CreateDMOutput> {
  logger.debug("Creating DM conversation", { participantCount: input.participantIds.length });

  // 1. Validate input
  const validatedInput = CreateDMInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Query recebe dados e gerencia campos técnicos internamente
  const dbDMConversation = await createDM({
    ...validatedInput,
    currentUserId: currentUser.id
  });
  
  // 4. Mapeamento: SelectDMConversation → DMConversation (sem campos técnicos)
  const apiDMConversation = {
    id: dbDMConversation.id,
    name: dbDMConversation.name,
    description: dbDMConversation.description,
    archivedAt: dbDMConversation.archivedAt ? new Date(dbDMConversation.archivedAt) : null,
    archivedBy: dbDMConversation.archivedBy,
    createdAt: new Date(dbDMConversation.createdAt),
    updatedAt: new Date(dbDMConversation.updatedAt),
  };
  
  // 5. Validate output
  const result = CreateDMOutputSchema.parse(apiDMConversation);
  
  // 6. Emit event
  eventBus.emit("dm:created", { dmId: result.id });
  
  logger.debug("DM conversation created", { dmId: result.id, name: result.name });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Dm {
      create: (input: CreateDMInput) => Promise<CreateDMOutput>
    }
  }
}
