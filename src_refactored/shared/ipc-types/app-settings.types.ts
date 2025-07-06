export type Theme = "light" | "dark" | "system";

export interface AppSettings {
  theme: Theme;
}

// App Settings
export type GetAppSettingsRequest = void;
export type GetAppSettingsResponse = AppSettings;

export type UpdateAppSettingsRequest = Partial<AppSettings>;
export type UpdateAppSettingsResponse = AppSettings;

export type AppSettingsUpdatedEventPayload = AppSettings;
