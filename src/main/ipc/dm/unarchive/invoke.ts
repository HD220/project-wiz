import { z } from "zod";
import { unarchiveDM } from "@/main/ipc/dm/queries";
import {
  UnarchiveDMInputSchema,
  UnarchiveDMOutputSchema,
  type UnarchiveDMInput,
  type UnarchiveDMOutput 
} from "@/shared/types/dm-conversation";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("dm.unarchive.invoke");

export default async function(dmId: UnarchiveDMInput): Promise<UnarchiveDMOutput> {
  logger.debug("Unarchiving DM conversation", { dmId });

  // 1. Parse and validate input
  const parsedDmId = UnarchiveDMInputSchema.parse(dmId);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Execute core business logic
  const result = await unarchiveDM(parsedDmId);
  
  // 4. Emit specific event for this operation
  eventBus.emit("dm:unarchived", { dmId });
  
  logger.debug("DM conversation unarchived", { dmId, success: result.success });
  
  // 5. Parse and return output
  return UnarchiveDMOutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface Dm {
      unarchive: (dmId: UnarchiveDMInput) => Promise<UnarchiveDMOutput>
    }
  }
}
EOF < /dev/null
