import { useEffect, useState } from 'react';
import { placeholderUserSidebarNavItems, UserSidebarNavItemPlaceholder } from '../lib/placeholders';

export const useSyncedUserSidebarNavItems = () => {
  const [navItems, setNavItems] = useState<UserSidebarNavItemPlaceholder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNavItems(placeholderUserSidebarNavItems);
      setIsLoading(false);
    }, 1000); // Simulate 1 second delay

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  return { navItems, isLoading };
};
