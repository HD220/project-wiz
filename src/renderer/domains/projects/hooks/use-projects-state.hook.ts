import { useProjectStore, ProjectState } from "../stores/project.store";

export function useProjectsState() {
  const selectedProject = useProjectStore(
    (state: ProjectState) => state.selectedProject,
  );
  const setSelectedProject = useProjectStore(
    (state: ProjectState) => state.setSelectedProject,
  );

  return {
    selectedProject,
    setSelectedProject,
  };
}
