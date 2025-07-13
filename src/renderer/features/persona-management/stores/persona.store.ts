import type {
  PersonaDto,
  CreatePersonaDto,
  UpdatePersonaDto,
  PersonaFilterDto
} from "../../../../shared/types/persona.types";

interface PersonaStoreState {
  personas: PersonaDto[];
  activePersonas: PersonaDto[];
  isLoading: boolean;
  error: string | null;
  selectedPersona: PersonaDto | null;
}

class PersonaStore {
  private state: PersonaStoreState = {
    personas: [],
    activePersonas: [],
    isLoading: false,
    error: null,
    selectedPersona: null,
  };

  private listeners = new Set<() => void>();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.state;

  getServerSnapshot = () => this.state;

  private notify = () => {
    this.listeners.forEach(listener => listener());
  };

  private setState = (newState: Partial<PersonaStoreState>) => {
    this.state = { ...this.state, ...newState };
    this.notify();
  };

  async loadPersonas(filter?: PersonaFilterDto, forceReload = false): Promise<void> {
    if (this.state.isLoading && !forceReload) return;

    this.setState({ isLoading: true, error: null });

    try {
      const personas = (await window.electronIPC?.invoke("persona:list", filter) || []) as PersonaDto[];
      this.setState({ personas, isLoading: false });
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : "Failed to load personas",
        isLoading: false,
      });
    }
  }

  async loadActivePersonas(forceReload = false): Promise<void> {
    console.log('[PersonaStore] loadActivePersonas called. Current state isLoading:', this.state.isLoading, 'forceReload:', forceReload);
    
    if (this.state.isLoading && !forceReload) {
      console.log('[PersonaStore] Skipping load because already loading and forceReload is false');
      return;
    }

    console.log('[PersonaStore] Loading active personas...');
    this.setState({ isLoading: true, error: null });

    try {
      console.log('[PersonaStore] About to call IPC invoke...');
      if (!window.electronIPC) {
        throw new Error('electronIPC not available');
      }
      
      const activePersonas = await window.electronIPC.invoke("persona:listActive");
      console.log('[PersonaStore] Raw IPC response:', activePersonas);
      
      const typedPersonas = (activePersonas || []) as PersonaDto[];
      console.log('[PersonaStore] Typed personas:', typedPersonas);
      
      this.setState({ activePersonas: typedPersonas, isLoading: false });
    } catch (error) {
      console.error('[PersonaStore] Error loading active personas:', error);
      this.setState({
        error: error instanceof Error ? error.message : "Failed to load active personas",
        isLoading: false,
      });
    }
  }

  async createPersona(data: CreatePersonaDto): Promise<void> {
    this.setState({ isLoading: true, error: null });

    try {
      const newPersona = (await window.electronIPC?.invoke("persona:create", data)) as PersonaDto;
      this.setState({
        personas: [...this.state.personas, newPersona],
        activePersonas: newPersona.isActive 
          ? [...this.state.activePersonas, newPersona]
          : this.state.activePersonas,
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : "Failed to create persona",
        isLoading: false,
      });
      throw error;
    }
  }

  async updatePersona(data: UpdatePersonaDto): Promise<void> {
    this.setState({ isLoading: true, error: null });

    try {
      const updatedPersona = (await window.electronIPC?.invoke("persona:update", data)) as PersonaDto;
      this.setState({
        personas: this.state.personas.map(p => 
          p.id === updatedPersona.id ? updatedPersona : p
        ),
        activePersonas: this.state.activePersonas.map(p => 
          p.id === updatedPersona.id ? updatedPersona : p
        ).filter(p => p.isActive),
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : "Failed to update persona",
        isLoading: false,
      });
      throw error;
    }
  }

  async deletePersona(id: string): Promise<void> {
    this.setState({ isLoading: true, error: null });

    try {
      await window.electronIPC?.invoke("persona:delete", id);
      this.setState({
        personas: this.state.personas.filter(p => p.id !== id),
        activePersonas: this.state.activePersonas.filter(p => p.id !== id),
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : "Failed to delete persona",
        isLoading: false,
      });
      throw error;
    }
  }

  async togglePersonaStatus(id: string): Promise<void> {
    this.setState({ isLoading: true, error: null });

    try {
      const updatedPersona = (await window.electronIPC?.invoke("persona:toggleStatus", id)) as PersonaDto;
      this.setState({
        personas: this.state.personas.map(p => 
          p.id === updatedPersona.id ? updatedPersona : p
        ),
        activePersonas: updatedPersona.isActive
          ? [...this.state.activePersonas.filter(p => p.id !== id), updatedPersona]
          : this.state.activePersonas.filter(p => p.id !== id),
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : "Failed to toggle persona status",
        isLoading: false,
      });
      throw error;
    }
  }

  async getPersonaById(id: string): Promise<PersonaDto | null> {
    try {
      return await window.electronIPC?.invoke("persona:getById", id) || null;
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : "Failed to get persona"
      });
      return null;
    }
  }

  setSelectedPersona = (persona: PersonaDto | null) => {
    this.setState({ selectedPersona: persona });
  };

  clearError = () => {
    this.setState({ error: null });
  };
}

export const personaStore = new PersonaStore();