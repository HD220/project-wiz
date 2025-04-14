export type Theme = "dark" | "light" | "system";

export interface StorageProvider {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class LocalStorageProvider implements StorageProvider {
  getItem(key: string): string | null {
    if (typeof window === "undefined" || !window.localStorage) {
      throw new Error("localStorage is not available in this environment.");
    }
    return window.localStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    if (typeof window === "undefined" || !window.localStorage) {
      throw new Error("localStorage is not available in this environment.");
    }
    window.localStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    if (typeof window === "undefined" || !window.localStorage) {
      throw new Error("localStorage is not available in this environment.");
    }
    window.localStorage.removeItem(key);
  }
}

function validateStorageKey(storageKey: unknown): asserts storageKey is string {
  if (typeof storageKey !== "string" || storageKey.trim() === "") {
    throw new Error("Invalid storageKey: must be a non-empty string.");
  }
}

export function getStoredTheme(
  storageKey: string,
  storage: StorageProvider = new LocalStorageProvider()
): Theme | null {
  validateStorageKey(storageKey);
  try {
    const stored = storage.getItem(storageKey);
    if (stored === "dark" || stored === "light" || stored === "system") {
      return stored;
    }
    return null;
  } catch (error) {
    // Optionally log error or handle as needed
    return null;
  }
}

export function setStoredTheme(
  storageKey: string,
  theme: Theme,
  storage: StorageProvider = new LocalStorageProvider()
): void {
  validateStorageKey(storageKey);
  try {
    storage.setItem(storageKey, theme);
  } catch (error) {
    // Optionally log error or handle as needed
  }
}

export function clearStoredTheme(
  storageKey: string,
  storage: StorageProvider = new LocalStorageProvider()
): void {
  validateStorageKey(storageKey);
  try {
    storage.removeItem(storageKey);
  } catch (error) {
    // Optionally log error or handle as needed
  }
}