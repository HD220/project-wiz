import { UserIdentity, UserSettings } from "../value-objects";

export class User {
  constructor(
    private userId: UserIdentity,
    private settings: UserSettings,
  ) {}

  updateSettings(newSettings: UserSettings): void {
    this.validateSettings(newSettings);
    this.settings = newSettings;
  }

  private validateSettings(settings: UserSettings): void {
    if (!settings) {
      throw new Error("Settings cannot be null");
    }
  }

  canReceiveMessage(): boolean {
    return this.settings.getValue().notifications;
  }

  getId(): UserIdentity {
    return this.userId;
  }

  getSettings(): UserSettings {
    return this.settings;
  }
}
