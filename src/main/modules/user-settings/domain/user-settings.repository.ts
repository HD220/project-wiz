import { UserSetting } from "@/main/modules/user-settings/domain/user-setting.entity";

export interface IUserSettingsRepository {
  save(setting: UserSetting): Promise<UserSetting>;
  findByUserIdAndKey(userId: string, key: string): Promise<UserSetting | undefined>;
  findByUserId(userId: string): Promise<UserSetting[]>;
}
