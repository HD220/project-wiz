import { z } from "zod";
import { listProjectChannels } from "@/main/ipc/channel/queries";
import { ChannelSchema } from "@/shared/types/channel";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("channel.get-project-channels.invoke");

// Input schema
const GetProjectChannelsInputSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  includeInactive: z.boolean().optional().default(false),
  includeArchived: z.boolean().optional().default(false),
});

// Output schema - array de channels com campos adicionais
const GetProjectChannelsOutputSchema = z.array(ChannelSchema.extend({
  isArchived: z.boolean(),
  isActive: z.boolean(),
  deactivatedAt: z.number().nullable(),
  deactivatedBy: z.string().nullable(),
  lastMessage: z.object({
    id: z.string(),
    content: z.string(),
    authorId: z.string(),
    createdAt: z.number(),
    updatedAt: z.number(),
  }).optional(),
}));

type GetProjectChannelsInput = z.infer<typeof GetProjectChannelsInputSchema>;
type GetProjectChannelsOutput = z.infer<typeof GetProjectChannelsOutputSchema>;

export default async function(input: GetProjectChannelsInput): Promise<GetProjectChannelsOutput> {
  logger.debug("Getting project channels", { projectId: input.projectId });

  // 1. Validate input
  const validatedInput = GetProjectChannelsInputSchema.parse(input);
  
  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. List channels with ownership validation
  const dbChannels = await listProjectChannels({
    projectId: validatedInput.projectId,
    ownerId: currentUser.id,
    includeInactive: validatedInput.includeInactive,
    includeArchived: validatedInput.includeArchived,
  });
  
  // 4. Map database results to API format
  const result = dbChannels.map(channel => ({
    id: channel.id,
    projectId: channel.projectId,
    name: channel.name,
    description: channel.description,
    archivedAt: channel.archivedAt ? new Date(channel.archivedAt) : null,
    archivedBy: channel.archivedBy,
    createdAt: new Date(channel.createdAt),
    updatedAt: new Date(channel.updatedAt),
    isArchived: !!channel.archivedAt,
    isActive: channel.isActive,
    deactivatedAt: channel.deactivatedAt,
    deactivatedBy: channel.deactivatedBy,
    lastMessage: channel.lastMessage
  }));
  
  logger.debug("Retrieved project channels", { count: result.length, projectId: validatedInput.projectId });
  
  // 5. Emit event
  eventBus.emit("channel:list", { projectId: validatedInput.projectId, channelCount: result.length });
  
  // 6. Validate and return output
  return GetProjectChannelsOutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface Channel {
      list: (input: GetProjectChannelsInput) => Promise<GetProjectChannelsOutput>
    }
  }
}