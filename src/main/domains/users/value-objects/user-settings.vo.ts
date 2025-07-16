import { z } from "zod";

const UserSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("system"),
  language: z.enum(["en", "pt-BR"]).default("en"),
  notifications: z.boolean().default(true),
});

export type UserSettingsValue = z.infer<typeof UserSettingsSchema>;

export class UserSettings {
  constructor(settings: Partial<UserSettingsValue> = {}) {
    const validated = UserSettingsSchema.parse(settings);
    this.value = validated;
  }

  private readonly value: UserSettingsValue;

  getValue(): UserSettingsValue {
    return this.value;
  }

  getTheme(): string {
    return this.value.theme;
  }

  equals(other: UserSettings): boolean {
    return JSON.stringify(this.value) === JSON.stringify(other.value);
  }

  toString(): string {
    return JSON.stringify(this.value);
  }
}
