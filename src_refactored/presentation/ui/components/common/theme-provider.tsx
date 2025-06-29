import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system'; // Added 'system' as a valid theme type

interface ThemeProviderState {
  theme: Theme; // This will store 'light' or 'dark' after resolving 'system'
  setTheme: (theme: Theme) => void;
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const storedTheme = localStorage.getItem(storageKey) as Theme | null;
      if (storedTheme) {
        return storedTheme;
      }
      return defaultTheme;
    } catch (_error) {
      // localStorage is not available (e.g., SSR or restricted environment)
      // console.warn('localStorage not available for theme persistence:', _error);
      return defaultTheme;
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let effectiveTheme = theme;
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    root.classList.add(effectiveTheme);

    try {
      // Store the raw theme value (could be 'system')
      localStorage.setItem(storageKey, theme);
    } catch (_error) {
      // Ignore localStorage errors if persistence fails
      // console.warn('Failed to persist theme to localStorage:', _error);
    }
  }, [theme, storageKey]);

  const handleSetTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = (): ThemeProviderState => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
