import { UserDto, UserSettingsDto, UserPreferencesDto } from "../../../../shared/types/user.types";
import { User, UserPreferences } from "../entities";
import { UserSchema } from "../../../persistence/schemas";

export function userToDto(userRecord: UserSchema): UserDto {
  return {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email || undefined,
    avatar: userRecord.avatar || undefined,
    settings: userRecord.settings as UserSettingsDto,
    createdAt: userRecord.createdAt.toISOString(),
    updatedAt: userRecord.updatedAt.toISOString(),
  };
}

export function userEntityToDto(user: User): UserDto {
  const userSettings = user.getSettings();
  return {
    id: user.getId().getValue(),
    name: "User", // This would need to be stored in the entity
    settings: userSettings.getValue(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function userPreferencesToDto(preferences: UserPreferences): UserPreferencesDto {
  const settings = preferences.getSettings();
  return {
    userId: preferences.getUserId().getValue(),
    theme: settings.getValue().theme,
    language: settings.getValue().language,
    notifications: settings.getValue().notifications,
  };
}