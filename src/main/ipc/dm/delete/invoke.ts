import { z } from "zod";
import { 
  deleteDM,
  type DeleteDMInput,
  type DeleteDMOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("dm.delete.invoke");

// Input type para o invoke (sem deletedBy que é adicionado automaticamente)
export type DeleteDMInvokeInput = Omit<DeleteDMInput, "deletedBy">;

export default async function(input: DeleteDMInvokeInput): Promise<DeleteDMOutput> {
  logger.debug("Deleting DM conversation", { dmId: input.dmId });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Add deletedBy from current user
  const deleteData = {
    ...input,
    deletedBy: currentUser.id
  };
  
  // 3. Execute core business logic
  const result = await deleteDM(deleteData);
  
  // 4. Emit specific event for this operation
  eventBus.emit("dm:deleted", { dmId: input.dmId });
  
  logger.debug("DM conversation deleted", { dmId: input.dmId, success: result.success });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Dm {
      delete: (input: DeleteDMInvokeInput) => Promise<DeleteDMOutput>
    }
  }
}
