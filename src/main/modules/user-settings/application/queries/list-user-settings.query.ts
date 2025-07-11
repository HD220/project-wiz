import { IQuery } from "@/main/kernel/cqrs-dispatcher";
import { ApplicationError } from "@/main/errors/application.error";
import { UserSetting } from "@/main/modules/user-settings/domain/user-setting.entity";
import { IUserSettingsRepository } from "@/main/modules/user-settings/domain/user-settings.repository";

export interface IListUserSettingsQueryPayload {
  userId: string;
}

export class ListUserSettingsQuery
  implements IQuery<IListUserSettingsQueryPayload>
{
  readonly type = "ListUserSettingsQuery";
  constructor(public payload: IListUserSettingsQueryPayload) {}
}

export class ListUserSettingsQueryHandler {
  constructor(private userSettingsRepository: IUserSettingsRepository) {}

  async handle(query: ListUserSettingsQuery): Promise<UserSetting[]> {
    try {
      return await this.userSettingsRepository.findByUserId(
        query.payload.userId,
      );
    } catch (error) {
      console.error(`Failed to list user settings:`, error);
      throw new ApplicationError(
        `Failed to list user settings: ${(error as Error).message}`,
      );
    }
  }
}
