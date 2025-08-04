import { z } from "zod";
import { 
  unarchiveDM,
  type UnarchiveDMInput,
  type UnarchiveDMOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("dm.unarchive.invoke");

export default async function(dmId: UnarchiveDMInput): Promise<UnarchiveDMOutput> {
  logger.debug("Unarchiving DM conversation", { dmId });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await unarchiveDM(dmId);
  
  // 3. Emit specific event for this operation
  eventBus.emit("dm:unarchived", { dmId });
  
  logger.debug("DM conversation unarchived", { dmId, success: result.success });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Dm {
      unarchive: (dmId: UnarchiveDMInput) => Promise<UnarchiveDMOutput>
    }
  }
}
EOF < /dev/null
