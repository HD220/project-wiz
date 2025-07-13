import { useSyncExternalStore, useEffect, useMemo, useRef } from "react";
import { personaStore } from "../stores/persona.store";
import type {
  CreatePersonaDto,
  UpdatePersonaDto,
  PersonaFilterDto
} from "../../../../shared/types/persona.types";
import { PersonaDto } from "../../../../shared/types/persona.types";

export function usePersonas(filter?: PersonaFilterDto) {
  const state = useSyncExternalStore(
    personaStore.subscribe,
    personaStore.getSnapshot,
    personaStore.getServerSnapshot,
  );

  const hasLoadedRef = useRef(false);
  const hasLoadedActiveRef = useRef(false);
  const filterRef = useRef(filter);
  filterRef.current = filter;

  useEffect(() => {
    const loadInitialPersonas = async () => {
      if (window.electronIPC && !hasLoadedRef.current) {
        hasLoadedRef.current = true;
        console.log('[usePersonas] Loading personas...');
        await personaStore.loadPersonas(filterRef.current);
      }
    };

    const loadInitialActivePersonas = async () => {
      if (window.electronIPC && !hasLoadedActiveRef.current) {
        hasLoadedActiveRef.current = true;
        console.log('[usePersonas] Loading active personas...');
        await personaStore.loadActivePersonas(true); // Force reload on first load
      }
    };

    console.log('[usePersonas] Effect running, electronIPC available:', !!window.electronIPC);
    loadInitialPersonas();
    loadInitialActivePersonas();
  }, []);

  const mutations = useMemo(() => ({
    createPersona: (data: CreatePersonaDto) =>
      personaStore.createPersona(data),

    updatePersona: (data: UpdatePersonaDto) =>
      personaStore.updatePersona(data),

    deletePersona: (id: string) =>
      personaStore.deletePersona(id),

    togglePersonaStatus: (id: string) =>
      personaStore.togglePersonaStatus(id),

    setSelectedPersona: (persona: PersonaDto | null) =>
      personaStore.setSelectedPersona(persona),

    clearError: () => personaStore.clearError(),
  }), []);

  const queries = useMemo(() => ({
    loadPersonas: (newFilter?: PersonaFilterDto, forceReload?: boolean) =>
      personaStore.loadPersonas(newFilter || filterRef.current, forceReload),

    loadActivePersonas: (forceReload?: boolean) =>
      personaStore.loadActivePersonas(forceReload),

    getPersonaById: (id: string) =>
      personaStore.getPersonaById(id),

    refetch: () =>
      personaStore.loadPersonas(filterRef.current, true),

    refetchActivePersonas: () =>
      personaStore.loadActivePersonas(true),
  }), []);

  // Get a specific persona by ID from local state
  const getPersonaByIdLocal = (id: string): PersonaDto | undefined => {
    return state.personas?.find((persona: PersonaDto) => persona.id === id);
  };

  return {
    personas: state.personas,
    activePersonas: state.activePersonas,
    isLoading: state.isLoading,
    error: state.error,
    selectedPersona: state.selectedPersona,
    getPersonaByIdLocal,
    ...mutations,
    ...queries,
  };
}