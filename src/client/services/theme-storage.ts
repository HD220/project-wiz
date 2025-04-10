export type Theme = "dark" | "light" | "system";

export function getStoredTheme(storageKey: string): Theme | null {
  const stored = localStorage.getItem(storageKey);
  if (stored === "dark" || stored === "light" || stored === "system") {
    return stored;
  }
  return null;
}

export function setStoredTheme(storageKey: string, theme: Theme): void {
  localStorage.setItem(storageKey, theme);
}

export function clearStoredTheme(storageKey: string): void {
  localStorage.removeItem(storageKey);
}