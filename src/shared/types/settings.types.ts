export interface UserSettings {
  username: string;
  email: string;
  language: "en" | "pt-BR";
  enableNotifications: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
}

export type SettingsUpdateHandler = (field: string, value: unknown) => void;