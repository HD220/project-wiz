import { create } from 'zustand';
import { PersonaPlaceholder, personasPlaceholder } from '../lib/placeholders';

interface PersonasState {
  personas: PersonaPlaceholder[];
  isLoading: boolean;
  fetchPersonas: () => Promise<void>;
}

export const usePersonasStore = create<PersonasState>((set) => ({
  personas: [],
  isLoading: false,
  fetchPersonas: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async delay
    set({ personas: personasPlaceholder, isLoading: false });
  },
}));
