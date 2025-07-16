import { relations } from "drizzle-orm";

import { channels } from "../channels.schema";

import { channelMessages } from "./table-definition";

export const channelMessagesRelations = relations(
  channelMessages,
  ({ one }) => ({
    channel: one(channels, {
      fields: [channelMessages.channelId],
      references: [channels.id],
    }),
  }),
);
