import type { SelectMessage } from "@/main/features/message/message.types";

export interface MessageGroup {
  authorId: string;
  messages: SelectMessage[];
}

export const processMessages = (messages: SelectMessage[]) => {
  const messageGroups: any[] = [];

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
