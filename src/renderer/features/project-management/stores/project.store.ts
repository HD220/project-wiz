import {
  ProjectDto,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectFilterDto,
} from "../../../../shared/types/project.types";

interface ProjectStoreState {
  projects: ProjectDto[];
  isLoading: boolean;
  error: string | null;
  selectedProject: ProjectDto | null;
}

class ProjectStore {
  private state: ProjectStoreState = {
    projects: [],
    isLoading: false,
    error: null,
    selectedProject: null,
  };

  private listeners = new Set<() => void>();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.state;

  getServerSnapshot = () => this.state;

  async loadProjects(filter?: ProjectFilterDto): Promise<void> {
    if (!window.electronIPC) {
      console.warn("ElectronIPC not available yet");
      return;
    }

    this.setState({ isLoading: true, error: null });

    try {
      const projects = (await window.electronIPC.invoke(
        "project:list",
        filter,
      )) as ProjectDto[];
      this.setState({ projects, isLoading: false });
    } catch (error) {
      this.setState({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  }

  async createProject(dto: CreateProjectDto): Promise<void> {
    try {
      await window.electronIPC.invoke("project:create", dto);
      await this.loadProjects();
    } catch (error) {
      this.setState({ error: (error as Error).message });
    }
  }

  async updateProject(dto: UpdateProjectDto): Promise<void> {
    try {
      await window.electronIPC.invoke("project:update", dto);
      await this.loadProjects();
    } catch (error) {
      this.setState({ error: (error as Error).message });
    }
  }

  async deleteProject(data: { id: string }): Promise<void> {
    try {
      await window.electronIPC.invoke("project:delete", data);
      await this.loadProjects();
    } catch (error) {
      this.setState({ error: (error as Error).message });
    }
  }

  async archiveProject(data: { id: string }): Promise<void> {
    try {
      await window.electronIPC.invoke("project:archive", data);
      await this.loadProjects();
    } catch (error) {
      this.setState({ error: (error as Error).message });
    }
  }

  async getProjectById(data: { id: string }): Promise<ProjectDto | null> {
    try {
      return await window.electronIPC.invoke("project:getById", data);
    } catch (error) {
      this.setState({ error: (error as Error).message });
      return null;
    }
  }

  private setState(partialState: Partial<ProjectStoreState>): void {
    this.state = { ...this.state, ...partialState };
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error("Error in store listener:", error);
      }
    });
  }
}

export const projectStore = new ProjectStore();
