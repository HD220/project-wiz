export interface AppSettings {
  [key: string]: string | number | boolean | object | null;
}

export interface SettingsRepositoryPort {
  getSettings(): Promise<AppSettings>;
  getSetting<T = unknown>(key: string): Promise<T | undefined>;
  saveSettings(settings: AppSettings): Promise<void>;
  updateSetting<T = unknown>(key: string, value: T): Promise<void>;
  deleteSetting(key: string): Promise<void>;
}