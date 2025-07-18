import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Sidebar state
  sidebarCollapsed: boolean;
  
  // Theme state
  theme: 'light' | 'dark' | 'system';
  
  // Modal states
  modals: {
    createProject: boolean;
    createAgent: boolean;
    createChannel: boolean;
    settings: boolean;
    agentSettings: boolean;
    projectSettings: boolean;
  };
  
  // Layout states
  rightSidebarCollapsed: boolean;
  
  // Loading states for UI actions
  isCreatingProject: boolean;
  isCreatingAgent: boolean;
  isCreatingChannel: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  openModal: (modal: keyof UIState['modals']) => void;
  closeModal: (modal: keyof UIState['modals']) => void;
  closeAllModals: () => void;
  
  toggleRightSidebar: () => void;
  setRightSidebarCollapsed: (collapsed: boolean) => void;
  
  setCreatingProject: (loading: boolean) => void;
  setCreatingAgent: (loading: boolean) => void;
  setCreatingChannel: (loading: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarCollapsed: false,
      theme: 'system',
      modals: {
        createProject: false,
        createAgent: false,
        createChannel: false,
        settings: false,
        agentSettings: false,
        projectSettings: false,
      },
      rightSidebarCollapsed: false,
      isCreatingProject: false,
      isCreatingAgent: false,
      isCreatingChannel: false,

      // Actions
      toggleSidebar: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),
      
      setSidebarCollapsed: (collapsed: boolean) => set({ 
        sidebarCollapsed: collapsed 
      }),
      
      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set({ theme });
        
        // Apply theme to document
        const root = document.documentElement;
        
        if (theme === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          root.classList.toggle('dark', prefersDark);
        } else {
          root.classList.toggle('dark', theme === 'dark');
        }
      },
      
      openModal: (modal: keyof UIState['modals']) => set((state) => ({
        modals: {
          ...state.modals,
          [modal]: true,
        },
      })),
      
      closeModal: (modal: keyof UIState['modals']) => set((state) => ({
        modals: {
          ...state.modals,
          [modal]: false,
        },
      })),
      
      closeAllModals: () => set((state) => ({
        modals: {
          createProject: false,
          createAgent: false,
          createChannel: false,
          settings: false,
          agentSettings: false,
          projectSettings: false,
        },
      })),
      
      toggleRightSidebar: () => set((state) => ({ 
        rightSidebarCollapsed: !state.rightSidebarCollapsed 
      })),
      
      setRightSidebarCollapsed: (collapsed: boolean) => set({ 
        rightSidebarCollapsed: collapsed 
      }),
      
      setCreatingProject: (loading: boolean) => set({ 
        isCreatingProject: loading 
      }),
      
      setCreatingAgent: (loading: boolean) => set({ 
        isCreatingAgent: loading 
      }),
      
      setCreatingChannel: (loading: boolean) => set({ 
        isCreatingChannel: loading 
      }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        rightSidebarCollapsed: state.rightSidebarCollapsed,
      }),
    }
  )
);

// Initialize theme on store creation
if (typeof window !== 'undefined') {
  const { theme } = useUIStore.getState();
  const root = document.documentElement;
  
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const currentTheme = useUIStore.getState().theme;
      if (currentTheme === 'system') {
        root.classList.toggle('dark', e.matches);
      }
    });
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
}