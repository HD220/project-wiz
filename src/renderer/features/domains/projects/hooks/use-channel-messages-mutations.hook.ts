import { useMutation, useQueryClient } from "@tanstack/react-query";

import { channelMessageService } from "../services/channel-message.service";

import type {
  CreateChannelMessageDto,
  UpdateChannelMessageDto,
} from "../../../../shared/types/domains/projects/channel-message.types";

export function useChannelMessagesMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateChannelMessageDto) =>
      channelMessageService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channelMessages"] });
    },
  });

  const createTextMutation = useMutation({
    mutationFn: ({
      content,
      channelId,
      authorId,
      authorName,
    }: {
      content: string;
      channelId: string;
      authorId: string;
      authorName: string;
    }) =>
      channelMessageService.createText(
        content,
        channelId,
        authorId,
        authorName,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channelMessages"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateChannelMessageDto) =>
      channelMessageService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channelMessages"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => channelMessageService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channelMessages"] });
    },
  });

  return {
    createMessage: createMutation.mutate,
    createTextMessage: createTextMutation.mutate,
    updateMessage: updateMutation.mutate,
    deleteMessage: deleteMutation.mutate,
  };
}
