import { z } from "zod";
import { inactivateDMConversation } from "@/main/ipc/dm/queries";
import { DMConversationSchema } from "@/shared/types/dm-conversation";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("dm.inactivate.invoke");

// Input schema - apenas o dmId (deactivatedBy vem do currentUser)
const InactivateDMInputSchema = z.object({
  dmId: z.string().min(1, "DM ID is required"),
});

// Output schema - extende DMConversationSchema com campos de inativação
const InactivateDMOutputSchema = DMConversationSchema.extend({
  isActive: z.boolean(),
  deactivatedAt: z.date().nullable(),
  deactivatedBy: z.string().nullable(),
});

type InactivateDMInput = z.infer<typeof InactivateDMInputSchema>;
type InactivateDMOutput = z.infer<typeof InactivateDMOutputSchema>;

export default async function(input: InactivateDMInput): Promise<InactivateDMOutput> {
  logger.debug("Inactivating DM conversation", { dmId: input.dmId });

  // 1. Validate input
  const validatedInput = InactivateDMInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Inactivate DM conversation with ownership validation
  const dbConversation = await inactivateDMConversation(validatedInput.dmId, currentUser.id, currentUser.id);
  
  if (!dbConversation) {
    throw new Error("Failed to inactivate DM conversation or access denied");
  }
  
  // 4. Map to API format
  const apiConversation = {
    id: dbConversation.id!,
    name: dbConversation.name,
    description: dbConversation.description,
    archivedAt: dbConversation.archivedAt,
    archivedBy: dbConversation.archivedBy,
    createdAt: dbConversation.createdAt,
    updatedAt: dbConversation.updatedAt,
    isActive: dbConversation.isActive,
    deactivatedAt: dbConversation.deactivatedAt,
    deactivatedBy: dbConversation.deactivatedBy,
  };
  
  // 5. Validate output
  const result = InactivateDMOutputSchema.parse(apiConversation);
  
  logger.debug("DM conversation inactivated", { dmId: result.id });
  
  // 6. Emit event
  eventBus.emit("dm:inactivated", { dmId: result.id });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Dm {
      inactivate: (input: InactivateDMInput) => Promise<InactivateDMOutput>
    }
  }
}
