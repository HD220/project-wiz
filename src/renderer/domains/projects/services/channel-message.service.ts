export * from "./channel-message-list.service";
export * from "./channel-message-crud.service";
export * from "./channel-message-search.service";

// Backward compatibility object
export const channelMessageService = {
  list: async (filter?: any) => {
    const { listChannelMessages } = await import(
      "./channel-message-list.service"
    );
    return listChannelMessages(filter);
  },
  listByChannel: async (channelId: string, limit = 50, offset = 0) => {
    const { listChannelMessagesByChannel } = await import(
      "./channel-message-list.service"
    );
    return listChannelMessagesByChannel(channelId, limit, offset);
  },
  getLatest: async (channelId: string, limit = 50) => {
    const { getLatestChannelMessages } = await import(
      "./channel-message-list.service"
    );
    return getLatestChannelMessages(channelId, limit);
  },
  getById: async (id: string) => {
    const { getChannelMessageById } = await import(
      "./channel-message-list.service"
    );
    return getChannelMessageById(id);
  },
  create: async (data: any) => {
    const { createChannelMessage } = await import(
      "./channel-message-crud.service"
    );
    return createChannelMessage(data);
  },
  createText: async (
    content: string,
    channelId: string,
    authorId: string,
    authorName: string,
  ) => {
    const { createTextChannelMessage } = await import(
      "./channel-message-crud.service"
    );
    return createTextChannelMessage(content, channelId, authorId, authorName);
  },
  update: async (data: any) => {
    const { updateChannelMessage } = await import(
      "./channel-message-crud.service"
    );
    return updateChannelMessage(data);
  },
  delete: async (id: string) => {
    const { deleteChannelMessage } = await import(
      "./channel-message-crud.service"
    );
    return deleteChannelMessage(id);
  },
  search: async (channelId: string, searchTerm: string, limit = 20) => {
    const { searchChannelMessages } = await import(
      "./channel-message-search.service"
    );
    return searchChannelMessages(channelId, searchTerm, limit);
  },
  getLastMessage: async (channelId: string) => {
    const { getLastChannelMessage } = await import(
      "./channel-message-list.service"
    );
    return getLastChannelMessage(channelId);
  },
};
