import { useEffect, useState } from 'react';
import { placeholderUserListForDM, UserPlaceholder } from '../lib/placeholders';

export const useSyncedUserListForDM = () => {
  const [users, setUsers] = useState<UserPlaceholder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setUsers(placeholderUserListForDM);
      setIsLoading(false);
    }, 1000); // Simulate 1 second delay

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  return { users, isLoading };
};
