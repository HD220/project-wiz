import { z } from "zod";
import { 
  createDM,
  type CreateDMInput,
  type CreateDMOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("dm.create.invoke");

// Input type para o invoke (sem currentUserId que é adicionado automaticamente)
export type CreateDMInvokeInput = Omit<CreateDMInput, "currentUserId">;

export default async function(params: CreateDMInvokeInput): Promise<CreateDMOutput> {
  logger.debug("Creating DM conversation", { participantCount: params.participantIds.length });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Add currentUserId from current user
  const dmData = {
    ...params,
    currentUserId: currentUser.id
  };
  
  // 3. Execute core business logic
  const result = await createDM(dmData);
  
  // 4. Emit specific event for this operation
  eventBus.emit("dm:created", { dmId: result.id });
  
  logger.debug("DM conversation created", { dmId: result.id, name: result.name });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Dm {
      create: (params: CreateDMInvokeInput) => Promise<CreateDMOutput>
    }
  }
}
