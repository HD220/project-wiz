import type { PersonaPlaceholder } from '@/infrastructure/frameworks/react/lib/placeholders'; // Adjusted path

// Augment Window interface for Electron API
declare global {
  interface Window {
    electronAPI?: {
      // ... other existing listeners if defined in a central d.ts ...
      onPersonasChanged: (callback: (personas: PersonaPlaceholder[]) => void) => void;
      removePersonasChangedListener: (callback: (personas: PersonaPlaceholder[]) => void) => void;
    };
    api?: {
      invoke: (channel: string, data?: any) => Promise<any>;
    };
  }
}

let personasSnapshot: PersonaPlaceholder[] = [];
const listeners = new Set<() => void>();

export function getSnapshot(): PersonaPlaceholder[] {
  return personasSnapshot;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    // Optional: Cleanup IPC listener
    // if (listeners.size === 0 && window.electronAPI?.removePersonasChangedListener) {
    //   window.electronAPI.removePersonasChangedListener(handlePersonasChanged);
    // }
  };
}

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

function handlePersonasChanged(newPersonas: PersonaPlaceholder[]): void {
  console.log("personas-store: Received personas update via IPC", newPersonas);
  personasSnapshot = newPersonas || [];
  emitChange();
}

let storeInitialized = false;

export async function initializePersonasStore(): Promise<void> {
  if (storeInitialized) {
    console.log("Personas store already initialized.");
    return;
  }
  storeInitialized = true;
  console.log("Initializing Personas store...");

  if (window.api?.invoke) {
    try {
      const personas = await window.api.invoke("query:get-personas") as PersonaPlaceholder[] | null;
      console.log("personas-store: Initial personas fetched:", personas);
      personasSnapshot = personas || [];
    } catch (error) {
      console.error("personas-store: Failed to initialize personas store:", error);
      personasSnapshot = [];
    }
  } else {
    console.warn("personas-store: window.api.invoke is not available.");
    personasSnapshot = [];
  }

  emitChange();

  if (window.electronAPI?.onPersonasChanged) {
    window.electronAPI.onPersonasChanged(handlePersonasChanged);
    console.log("personas-store: Subscribed to personas changes via IPC.");
  } else {
    console.warn("personas-store: window.electronAPI.onPersonasChanged is not available.");
  }
}

initializePersonasStore();
