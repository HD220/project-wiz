import { z } from "zod";
import { deleteDM } from "./queries";
import {
  DeleteDMInputSchema,
  DeleteDMOutputSchema,
  type DeleteDMInput,
  type DeleteDMOutput 
} from "@/shared/types/dm-conversation";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("dm.delete.invoke");

// Input type para o invoke (sem deletedBy que é adicionado automaticamente)
export type DeleteDMInvokeInput = Omit<DeleteDMInput, "deletedBy">;

export default async function(input: DeleteDMInvokeInput): Promise<DeleteDMOutput> {
  logger.debug("Deleting DM conversation", { dmId: input.dmId });

  // 1. Parse and validate input
  const parsedInput = z.object({
    dmId: z.string().min(1, "DM ID is required")
  }).parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Add deletedBy from current user
  const deleteData: DeleteDMInput = {
    ...parsedInput,
    deletedBy: currentUser.id
  };
  
  // 4. Execute core business logic
  const result = await deleteDM(deleteData);
  
  // 5. Emit specific event for this operation
  eventBus.emit("dm:deleted", { dmId: input.dmId });
  
  logger.debug("DM conversation deleted", { dmId: input.dmId, success: result.success });
  
  // 6. Parse and return output
  return DeleteDMOutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface Dm {
      delete: (input: DeleteDMInvokeInput) => Promise<DeleteDMOutput>
    }
  }
}
