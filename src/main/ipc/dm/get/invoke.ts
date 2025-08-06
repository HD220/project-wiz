import { z } from "zod";
import { findDMConversation } from "@/main/ipc/dm/queries";
import { DMConversationSchema } from "@/shared/types/dm-conversation";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("dm.get.invoke");

// Input schema - object wrapper para consistência
const GetDMInputSchema = z.object({
  dmId: z.string().min(1, "DM ID is required"),
});

// Output schema - extende DMConversationSchema com campos adicionais
const GetDMOutputSchema = DMConversationSchema.extend({
  isActive: z.boolean(),
  deactivatedAt: z.date().nullable(),
  deactivatedBy: z.string().nullable(),
}).nullable();

type GetDMInput = z.infer<typeof GetDMInputSchema>;
type GetDMOutput = z.infer<typeof GetDMOutputSchema>;

export default async function(input: GetDMInput): Promise<GetDMOutput> {
  logger.debug("Getting DM by ID", { dmId: input.dmId });

  // 1. Validate input
  const validatedInput = GetDMInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Find DM conversation with ownership validation
  const dbConversation = await findDMConversation(validatedInput.dmId, currentUser.id);
  
  // 4. Map to API format
  const result = dbConversation ? {
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
  } : null;
  
  logger.debug("DM found", { found: !!result, dmId: validatedInput.dmId });
  
  // 5. Emit event
  eventBus.emit("dm:get", { dmId: validatedInput.dmId, found: !!result });
  
  // 6. Validate and return output
  return GetDMOutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface Dm {
      get: (input: GetDMInput) => Promise<GetDMOutput>
    }
  }
}