import { useEffect, useState } from 'react';
import { placeholderDirectMessageThreads, DirectMessageThreadPlaceholder } from '../lib/placeholders';

export const useSyncedDirectMessageThreads = () => {
  const [threads, setThreads] = useState<DirectMessageThreadPlaceholder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setThreads(placeholderDirectMessageThreads);
      setIsLoading(false);
    }, 1000); // Simulate 1 second delay

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  return { threads, isLoading };
};
