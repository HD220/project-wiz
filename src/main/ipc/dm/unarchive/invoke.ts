import { z } from "zod";
import { unarchiveDMConversation } from "@/main/ipc/dm/queries";
import { DMConversationSchema } from "@/shared/types/dm-conversation";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("dm.unarchive.invoke");

// Input schema
const UnarchiveDMInputSchema = z.object({
  dmId: z.string().min(1, "DM ID is required"),
});

// Output schema
const UnarchiveDMOutputSchema = DMConversationSchema.extend({
  archivedAt: z.date().nullable(),
  archivedBy: z.string().nullable(),
});

type UnarchiveDMInput = z.infer<typeof UnarchiveDMInputSchema>;
type UnarchiveDMOutput = z.infer<typeof UnarchiveDMOutputSchema>;

export default async function(input: UnarchiveDMInput): Promise<UnarchiveDMOutput> {
  logger.debug("Unarchiving DM conversation", { dmId: input.dmId });

  // 1. Validate input
  const validatedInput = UnarchiveDMInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Execute query with ownership validation
  const dbConversation = await unarchiveDMConversation(validatedInput.dmId, currentUser.id);
  
  if (!dbConversation) {
    throw new Error("DM conversation not found or access denied");
  }
  
  // 4. Map database result to API format
  const apiConversation = {
    id: dbConversation.id,
    name: dbConversation.name,
    description: dbConversation.description,
    archivedAt: dbConversation.archivedAt ? new Date(dbConversation.archivedAt) : null,
    archivedBy: dbConversation.archivedBy,
    createdAt: new Date(dbConversation.createdAt),
    updatedAt: new Date(dbConversation.updatedAt),
  };
  
  // 5. Emit event
  eventBus.emit("dm:unarchived", { dmId: validatedInput.dmId });
  
  logger.debug("DM conversation unarchived", { dmId: validatedInput.dmId });
  
  // 6. Validate and return output
  return UnarchiveDMOutputSchema.parse(apiConversation);
}

declare global {
  namespace WindowAPI {
    interface Dm {
      unarchive: (input: UnarchiveDMInput) => Promise<UnarchiveDMOutput>
    }
  }
}
