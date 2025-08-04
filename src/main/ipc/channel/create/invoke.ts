import { z } from "zod";
import { 
  createChannel,
  type CreateChannelInput,
  type CreateChannelOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("channel.create.invoke");

export default async function(params: CreateChannelInput): Promise<CreateChannelOutput> {
  logger.debug("Creating project channel", { projectId: params.projectId, channelName: params.name });

  // 1. Check authentication (replicando a lógica do controller original)
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await createChannel(params);
  
  // 3. Emit specific event for channel creation
  eventBus.emit("channel:created", { channelId: result.id });
  
  logger.debug("Project channel created", { channelId: result.id, channelName: result.name });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Channel {
      create: (params: CreateChannelInput) => Promise<CreateChannelOutput>
    }
  }
}