import { useEffect, useState } from 'react';
import { placeholderProjectNavItems, ProjectNavItemPlaceholder } from '../lib/placeholders';

export const useSyncedProjectNavItems = (projectId: string | null | undefined) => {
  const [navItems, setNavItems] = useState<ProjectNavItemPlaceholder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (projectId) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        // In a real scenario, you might fetch nav items specific to the projectId
        setNavItems(placeholderProjectNavItems);
        setIsLoading(false);
      }, 1000); // Simulate 1 second delay

      return () => clearTimeout(timer); // Cleanup timer on unmount
    } else {
      setNavItems([]);
      setIsLoading(false);
    }
  }, [projectId]);

  return { navItems, isLoading };
};
