import { useEffect, useState } from 'react';
import { placeholderDirectMessages, PlaceholderChatMessage } from '../lib/placeholders';

export const useSyncedDirectMessages = () => {
  const [messages, setMessages] = useState<PlaceholderChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages(placeholderDirectMessages);
      setIsLoading(false);
    }, 1000); // Simulate 1 second delay

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  return { messages, isLoading };
};
