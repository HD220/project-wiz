import { IQuery } from "@/main/kernel/cqrs-dispatcher";
import { ApplicationError } from "@/main/errors/application.error";
import { UserSetting } from "@/main/modules/user-settings/domain/user-setting.entity";
import { IUserSettingsRepository } from "@/main/modules/user-settings/domain/user-settings.repository";

export interface IGetUserSettingQueryPayload {
  userId: string;
  key: string;
}

export class GetUserSettingQuery
  implements IQuery<IGetUserSettingQueryPayload>
{
  readonly type = "GetUserSettingQuery";
  constructor(public payload: IGetUserSettingQueryPayload) {}
}

export class GetUserSettingQueryHandler {
  constructor(private userSettingsRepository: IUserSettingsRepository) {}

  async handle(query: GetUserSettingQuery): Promise<UserSetting | undefined> {
    try {
      return await this.userSettingsRepository.findByUserIdAndKey(
        query.payload.userId,
        query.payload.key,
      );
    } catch (error) {
      console.error(`Failed to get user setting:`, error);
      throw new ApplicationError(
        `Failed to get user setting: ${(error as Error).message}`,
      );
  }
}
