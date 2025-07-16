import { createProjectMessage } from "../../../domains/projects/functions";

export async function handleCreateTextMessage(_, data) {
  return await createProjectMessage({
    content: data.content,
    channelId: data.channelId,
    authorId: data.authorId,
    authorName: data.authorName,
    type: "text",
  });
}

export async function handleCreateCodeMessage(_, data) {
  return await createProjectMessage({
    content: data.content,
    channelId: data.channelId,
    authorId: data.authorId,
    authorName: data.authorName,
    type: "code",
    metadata: data.metadata,
  });
}

export async function handleCreateSystemMessage(_, data) {
  return await createProjectMessage({
    content: data.content,
    channelId: data.channelId,
    authorId: "system",
    authorName: "System",
    type: "system",
    metadata: data.metadata,
  });
}
