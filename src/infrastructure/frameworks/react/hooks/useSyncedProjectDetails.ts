import { useEffect, useState } from 'react';
import { getProjectDetailsPlaceholder, PlaceholderTask, PlaceholderTeamMember } from '../lib/placeholders';

interface ProjectDetails {
  tasks: PlaceholderTask[];
  teamMembers: PlaceholderTeamMember[];
}

export const useSyncedProjectDetails = (projectId: string | null | undefined) => {
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (projectId) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        const details = getProjectDetailsPlaceholder(projectId);
        setProjectDetails(details);
        setIsLoading(false);
      }, 1000); // Simulate 1 second delay

      return () => clearTimeout(timer); // Cleanup timer on unmount
    } else {
      setProjectDetails(null);
      setIsLoading(false);
    }
  }, [projectId]);

  return { projectDetails, isLoading };
};
