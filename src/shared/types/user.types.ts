export interface UserDto {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  settings: UserSettingsDto;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettingsDto {
  theme: "light" | "dark" | "system";
  language: "en" | "pt-BR";
  notifications: boolean;
}

export interface CreateUserDto {
  name: string;
  email?: string;
  avatar?: string;
  settings?: UserSettingsDto;
}

export interface UpdateUserDto {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
}

export interface UpdateUserSettingsDto {
  id: string;
  settings: UserSettingsDto;
}

export interface UserPreferencesDto {
  userId: string;
  theme: "light" | "dark" | "system";
  language: "en" | "pt-BR";
  notifications: boolean;
}
