import { getDatabase } from "../../../infrastructure/database";
import { getLogger } from "../../../infrastructure/logger";
import {
  channels,
  type ChannelSchema,
} from "../../../persistence/schemas/channels.schema";
import { Channel } from "../entities";
import { findChannelsByProject } from "./channel-crud.functions";

const logger = getLogger("channels.operations");

export async function findAccessibleChannels(
  projectId: string,
  userId: string,
): Promise<ChannelSchema[]> {
  try {
    const allChannels = await findChannelsByProject(projectId);

    const accessibleChannels = allChannels.filter((channelData) => {
      const channel = new Channel(channelData);
      return channel.canBeAccessedBy(userId);
    });

    logger.info(
      `Found ${accessibleChannels.length} accessible channels for user: ${userId}`,
    );
    return accessibleChannels;
  } catch (error) {
    logger.error("Failed to find accessible channels", {
      error,
      projectId,
      userId,
    });
    throw error;
  }
}

export async function createGeneralChannel(
  projectId: string,
  createdBy: string,
): Promise<ChannelSchema> {
  try {
    const channel = Channel.createGeneral(projectId, createdBy);

    const db = getDatabase();
    const saved = await db
      .insert(channels)
      .values(channel.toPlainObject())
      .returning();

    logger.info(`General channel created for project: ${projectId}`);
    return saved[0];
  } catch (error) {
    logger.error("Failed to create general channel", {
      error,
      projectId,
      createdBy,
    });
    throw error;
  }
}