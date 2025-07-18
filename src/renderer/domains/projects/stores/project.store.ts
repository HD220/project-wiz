import { create } from "zustand";

import { ProjectDto } from "../../../../shared/types/domains/projects/project.types";

export interface ProjectState {
  selectedProject: ProjectDto | null;
  setSelectedProject: (project: ProjectDto | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  selectedProject: null,
  setSelectedProject: (project: ProjectDto | null) =>
    set({ selectedProject: project }),
}));
