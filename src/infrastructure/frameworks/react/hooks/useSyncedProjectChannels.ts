import { useEffect, useState } from 'react';
import { placeholderProjectChannels, ProjectChannelPlaceholder } from '../lib/placeholders';

export const useSyncedProjectChannels = (projectId: string | null | undefined) => {
  const [channels, setChannels] = useState<ProjectChannelPlaceholder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (projectId) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        // In a real scenario, you might fetch channels specific to the projectId
        setChannels(placeholderProjectChannels);
        setIsLoading(false);
      }, 1000); // Simulate 1 second delay

      return () => clearTimeout(timer); // Cleanup timer on unmount
    } else {
      setChannels([]);
      setIsLoading(false);
    }
  }, [projectId]);

  return { channels, isLoading };
};
