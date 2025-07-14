import { useSyncExternalStore } from "react";
import { typingStore } from "../stores/typing.store";

export function useTyping(channelId: string) {
  const state = useSyncExternalStore(
    typingStore.subscribe,
    typingStore.getSnapshot,
    typingStore.getServerSnapshot,
  );

  // Get typing state directly from the synchronized state instead of calling isChannelTyping
  const typingInfo = state[channelId];
  const isTyping = typingInfo?.isTyping || false;

  const setTyping = (typing: boolean) => {
    typingStore.setTyping(channelId, typing);
  };

  return {
    isTyping,
    setTyping,
  };
}
