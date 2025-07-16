import { useTypingStore } from "../stores/typing.store";

export function useTyping(channelId: string) {
  const typingChannels = useTypingStore((state: any) => state.typingChannels);
  const setTypingAction = useTypingStore((state: any) => state.setTyping);

  const typingInfo = typingChannels[channelId];
  const isTyping = typingInfo?.isTyping || false;

  const setTyping = (typing: boolean) => {
    setTypingAction(channelId, typing);
  };

  return {
    isTyping,
    setTyping,
  };
}
