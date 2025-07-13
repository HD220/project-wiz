import { useSyncExternalStore, useEffect, useMemo, useRef } from "react";
import type {
  PersonaDto,
  AddPersonaToProjectDto,
  RemovePersonaFromProjectDto,
} from "../../../../shared/types/persona.types";

interface ProjectPersonasState {
  projectPersonas: PersonaDto[];
  availablePersonas: PersonaDto[];
  isLoading: boolean;
  error: string | null;
}

class ProjectPersonasStore {
  private state: ProjectPersonasState = {
    projectPersonas: [],
    availablePersonas: [],
    isLoading: false,
    error: null,
  };

  private listeners = new Set<() => void>();

  // For useSyncExternalStore
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.state;
  getServerSnapshot = () => this.state;

  // Update state and notify listeners
  private setState(newState: Partial<ProjectPersonasState>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener());
  }

  // Load project personas
  async loadProjectPersonas(projectId: string, forceReload = false): Promise<void> {
    if (!window.electronIPC) {
      console.warn("ElectronIPC not available yet");
      return;
    }

    // Avoid unnecessary reloads
    if (!forceReload && this.state.projectPersonas.length > 0 && !this.state.isLoading) {
      return;
    }

    this.setState({ isLoading: true, error: null });

    try {
      const projectPersonas = (await window.electronIPC.invoke(
        "persona:listByProject",
        projectId,
      )) as PersonaDto[];

      this.setState({
        projectPersonas,
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  }

  // Load available personas (not in project)
  async loadAvailablePersonas(projectId: string): Promise<void> {
    if (!window.electronIPC) {
      console.warn("ElectronIPC not available yet");
      return;
    }

    try {
      const availablePersonas = (await window.electronIPC.invoke(
        "persona:listNotInProject",
        projectId,
      )) as PersonaDto[];

      this.setState({
        availablePersonas,
      });
    } catch (error) {
      this.setState({
        error: (error as Error).message,
      });
    }
  }

  // Add persona to project
  async addPersonaToProject(data: AddPersonaToProjectDto): Promise<void> {
    if (!window.electronIPC) return;

    this.setState({ isLoading: true, error: null });

    try {
      await window.electronIPC.invoke("persona:addToProject", data);

      // Reload both lists
      await Promise.all([
        this.loadProjectPersonas(data.projectId, true),
        this.loadAvailablePersonas(data.projectId),
      ]);

      this.setState({ isLoading: false });
    } catch (error) {
      this.setState({
        error: (error as Error).message,
        isLoading: false,
      });
      throw error;
    }
  }

  // Remove persona from project
  async removePersonaFromProject(data: RemovePersonaFromProjectDto): Promise<void> {
    if (!window.electronIPC) return;

    this.setState({ isLoading: true, error: null });

    try {
      await window.electronIPC.invoke("persona:removeFromProject", data);

      // Reload both lists
      await Promise.all([
        this.loadProjectPersonas(data.projectId, true),
        this.loadAvailablePersonas(data.projectId),
      ]);

      this.setState({ isLoading: false });
    } catch (error) {
      this.setState({
        error: (error as Error).message,
        isLoading: false,
      });
      throw error;
    }
  }

  // Clear error
  clearError() {
    this.setState({ error: null });
  }

  // Reset state when changing projects
  resetState() {
    this.setState({
      projectPersonas: [],
      availablePersonas: [],
      isLoading: false,
      error: null,
    });
  }
}

// Singleton instance
const projectPersonasStore = new ProjectPersonasStore();

export function useProjectPersonas(projectId?: string) {
  const state = useSyncExternalStore(
    projectPersonasStore.subscribe,
    projectPersonasStore.getSnapshot,
    projectPersonasStore.getServerSnapshot,
  );

  const hasLoadedRef = useRef(false);
  const currentProjectIdRef = useRef(projectId);

  // Reset when project changes
  useEffect(() => {
    if (currentProjectIdRef.current !== projectId) {
      currentProjectIdRef.current = projectId;
      hasLoadedRef.current = false;
      projectPersonasStore.resetState();
    }
  }, [projectId]);

  // Auto-loading when electronIPC becomes available and projectId is provided
  useEffect(() => {
    const loadInitialData = async () => {
      if (window.electronIPC && projectId && !hasLoadedRef.current) {
        hasLoadedRef.current = true;
        await Promise.all([
          projectPersonasStore.loadProjectPersonas(projectId),
          projectPersonasStore.loadAvailablePersonas(projectId),
        ]);
      }
    };

    loadInitialData();
  }, [projectId]);

  // Memoized operations
  const operations = useMemo(() => ({
    addPersonaToProject: (personaId: string, addedBy: string) => {
      if (!projectId) return Promise.reject(new Error("Project ID is required"));
      return projectPersonasStore.addPersonaToProject({
        projectId,
        personaId,
        addedBy,
      });
    },

    removePersonaFromProject: (personaId: string) => {
      if (!projectId) return Promise.reject(new Error("Project ID is required"));
      return projectPersonasStore.removePersonaFromProject({
        projectId,
        personaId,
      });
    },

    refetchProjectPersonas: () => {
      if (!projectId) return Promise.resolve();
      return projectPersonasStore.loadProjectPersonas(projectId, true);
    },

    refetchAvailablePersonas: () => {
      if (!projectId) return Promise.resolve();
      return projectPersonasStore.loadAvailablePersonas(projectId);
    },

    clearError: () => projectPersonasStore.clearError(),
  }), [projectId]);

  return {
    // State
    projectPersonas: state.projectPersonas,
    availablePersonas: state.availablePersonas,
    isLoading: state.isLoading,
    error: state.error,

    // Operations
    ...operations,
  };
}