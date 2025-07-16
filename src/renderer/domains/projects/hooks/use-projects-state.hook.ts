import { useProjectStore } from "../stores/project.store";

export function useProjectsState() {
  const selectedProject = useProjectStore((state: any) => state.selectedProject);
  const setSelectedProject = useProjectStore((state: any) => state.setSelectedProject);

  return {
    selectedProject,
    setSelectedProject,
  };
}