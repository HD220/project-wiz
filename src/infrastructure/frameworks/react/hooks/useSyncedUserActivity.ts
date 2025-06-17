import { useEffect, useState } from 'react';
import { placeholderUserActivity, PlaceholderActivity } from '../lib/placeholders';

export const useSyncedUserActivity = () => {
  const [activities, setActivities] = useState<PlaceholderActivity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActivities(placeholderUserActivity);
      setIsLoading(false);
    }, 1000); // Simulate 1 second delay

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  return { activities, isLoading };
};
