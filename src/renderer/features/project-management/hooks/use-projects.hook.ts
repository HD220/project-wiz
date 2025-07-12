import { useSyncExternalStore, useMemo, useRef, useEffect } from "react";
import { projectStore } from "../stores/project.store";
import {
  ProjectFilterDto,
  CreateProjectDto,
  UpdateProjectDto,
} from "../../../../shared/types/project.types";

export function useProjects(filter?: ProjectFilterDto) {
  const state = useSyncExternalStore(
    projectStore.subscribe,
    projectStore.getSnapshot,
    projectStore.getServerSnapshot,
  );

  const filterRef = useRef(filter);
  const hasLoadedRef = useRef(false);

  // Update filter ref when filter changes
  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  // Load projects only once when component mounts or when electronIPC becomes available
  useEffect(() => {
    const loadInitialProjects = async () => {
      if (window.electronIPC && !hasLoadedRef.current) {
        hasLoadedRef.current = true;
        await projectStore.loadProjects(filterRef.current);
      }
    };

    loadInitialProjects();
  }, []);

  const mutations = useMemo(() => ({
    createProject: (data: CreateProjectDto) => projectStore.createProject(data),
    updateProject: (data: UpdateProjectDto) => projectStore.updateProject(data),
    deleteProject: (data: { id: string }) => projectStore.deleteProject(data),
    archiveProject: (data: { id: string }) => projectStore.archiveProject(data),
  }), []);

  const queries = useMemo(() => ({
    loadProjects: (newFilter?: ProjectFilterDto, forceReload?: boolean) => 
      projectStore.loadProjects(newFilter || filterRef.current, forceReload),
    getProjectById: (data: { id: string }) => 
      projectStore.getProjectById(data),
    refreshProjects: () => projectStore.loadProjects(filterRef.current, true),
  }), []);

  return {
    projects: state.projects,
    isLoading: state.isLoading,
    error: state.error,
    selectedProject: state.selectedProject,
    
    ...mutations,
    ...queries,
  };
}
