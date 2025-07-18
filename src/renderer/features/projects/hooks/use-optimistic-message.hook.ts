import { useCallback } from "react";

import type { ChannelMessageDto } from "../../../../shared/types/projects/channel-message.types";

interface UseOptimisticMessageProps {
  channelId: string;
  authorId: string;
  authorName: string;
}

export function useOptimisticMessage(props: UseOptimisticMessageProps) {
  const createOptimisticMessage = useCallback(
    (content: string): ChannelMessageDto => ({
      id: `temp-user-${Date.now()}`,
      content: content.trim(),
      channelId: props.channelId,
      authorId: props.authorId,
      authorName: props.authorName,
      type: "text",
      createdAt: new Date(),
      updatedAt: new Date(),
      isEdited: false,
      metadata: {},
      isOptimistic: true as const,
    }),
    [props],
  );

  return { createOptimisticMessage };
}
