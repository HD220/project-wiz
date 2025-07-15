import { UserIdentity, UserSettings } from "../value-objects";

export class UserPreferences {
  constructor(
    private userId: UserIdentity,
    private settings: UserSettings,
  ) {}

  applyThemePreference(): string {
    return this.settings.getTheme();
  }

  updatePreferences(newSettings: UserSettings): void {
    this.validatePreferences(newSettings);
    this.settings = newSettings;
  }

  private validatePreferences(settings: UserSettings): void {
    if (!settings) {
      throw new Error("Preferences cannot be null");
    }
  }

  getUserId(): UserIdentity {
    return this.userId;
  }

  getSettings(): UserSettings {
    return this.settings;
  }
}
