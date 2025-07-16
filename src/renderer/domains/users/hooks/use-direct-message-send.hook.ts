import { useCallback } from "react";

import { useDirectMessageSendCore } from "./use-direct-message-send-core.hook";
import { useDirectMessageSendHandler } from "./use-direct-message-send-handler.hook";

import type { DirectMessageSendProps } from "./use-direct-message-send.types";

export function useDirectMessageSend(props: DirectMessageSendProps) {
  const core = useDirectMessageSendCore(props);
  const handler = useDirectMessageSendHandler(props, core);

  const sendMessage = useCallback(
    (content: string) => handler.sendMessage(content),
    [handler],
  );

  return { sendMessage };
}
