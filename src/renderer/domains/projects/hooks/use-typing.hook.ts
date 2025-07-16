import { useTypingStore, ChannelTypingInfo } from "../stores/typing.store";
import { TypingState } from "../stores/typing.store";

export function useTyping(channelId: string) {
  const typingChannels = useTypingStore(
    (state: TypingState) => state.typingChannels,
  );
  const setTypingAction = useTypingStore(
    (state: TypingState) => state.setTyping,
  );

  const typingInfo: ChannelTypingInfo | undefined = typingChannels[channelId];
  const isTyping = typingInfo?.isTyping || false;

  const setTyping = (typing: boolean) => {
    setTypingAction(channelId, typing);
  };

  return {
    isTyping,
    setTyping,
  };
}
