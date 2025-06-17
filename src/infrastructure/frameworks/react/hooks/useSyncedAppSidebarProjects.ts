import { useEffect, useState } from 'react';
import { placeholderAppSidebarProjects, AppSidebarProjectPlaceholder } from '../lib/placeholders';

export const useSyncedAppSidebarProjects = () => {
  const [projects, setProjects] = useState<AppSidebarProjectPlaceholder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProjects(placeholderAppSidebarProjects);
      setIsLoading(false);
    }, 1000); // Simulate 1 second delay

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  return { projects, isLoading };
};
