import { create, SetState } from "zustand";

import { ProjectDto } from "../../../../shared/types/domains/projects/project.types";

interface ProjectState {
  selectedProject: ProjectDto | null;
  setSelectedProject: (project: ProjectDto | null) => void;
}

export const useProjectStore = create<ProjectState>(
  (set: SetState<ProjectState>) => ({
    selectedProject: null,
    setSelectedProject: (project: ProjectDto | null) =>
      set({ selectedProject: project }),
  }),
);
