import { useEffect, useRef } from 'react';
import type { MessageDto } from '../../../../shared/types/domains/users/message.types';

export function useConversationAutoScroll(messages: MessageDto[], isTyping: boolean, conversationId: string) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  const previousMessagesLength = useRef(0);

  useEffect(() => {
    if (messagesEndRef.current) {
      if (isInitialLoad.current && messages.length > 0) {
        messagesEndRef.current.scrollIntoView({ behavior: "instant" });
        isInitialLoad.current = false;
        previousMessagesLength.current = messages.length;
      } else if (messages.length > previousMessagesLength.current || isTyping) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        previousMessagesLength.current = messages.length;
      }
    }
  }, [messages, isTyping]);

  useEffect(() => {
    isInitialLoad.current = true;
    previousMessagesLength.current = 0;
  }, [conversationId]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return { messagesEndRef, scrollToBottom };
}