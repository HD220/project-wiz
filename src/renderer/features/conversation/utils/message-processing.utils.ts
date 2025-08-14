import type { SelectMessage } from "@/renderer/features/conversation/types";

export interface MessageGroup {
  authorId: string;
  messages: SelectMessage[];
}

export const processMessages = (messages: SelectMessage[]) => {
  const messageGroups: MessageGroup[] = [];

  messages.forEach((msg: SelectMessage) => {
    const lastGroup = messageGroups[messageGroups.length - 1];

    if (lastGroup && lastGroup.authorId === msg.authorId) {
      lastGroup.messages.push(msg);
    } else {
      messageGroups.push({
        authorId: msg.authorId,
        messages: [msg],
      });
    }
  });

  return messageGroups;
};
