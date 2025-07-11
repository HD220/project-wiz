import { ICommand } from "@/main/kernel/cqrs-dispatcher";
import { ApplicationError } from "@/main/errors/application.error";
import { UserSetting } from "@/main/modules/user-settings/domain/user-setting.entity";
import { IUserSettingsRepository } from "@/main/modules/user-settings/domain/user-settings.repository";

export interface ISaveUserSettingCommandPayload {
  userId: string;
  key: string;
  value: string;
}

export class SaveUserSettingCommand
  implements ICommand<ISaveUserSettingCommandPayload>
{
  readonly type = "SaveUserSettingCommand";
  constructor(public payload: ISaveUserSettingCommandPayload) {}
}

export class SaveUserSettingCommandHandler {
  constructor(private userSettingsRepository: IUserSettingsRepository) {}

  async handle(command: SaveUserSettingCommand): Promise<UserSetting> {
    try {
      const existingSetting =
        await this.userSettingsRepository.findByUserIdAndKey(
          command.payload.userId,
          command.payload.key,
        );

      if (existingSetting) {
        existingSetting.updateValue(command.payload.value);
        return await this.userSettingsRepository.save(existingSetting);
      }
      const newSetting = new UserSetting({
        userId: command.payload.userId,
        key: command.payload.key,
        value: command.payload.value,
      });
      return await this.userSettingsRepository.save(newSetting);
    } catch (error) {
      console.error(`Failed to save user setting:`, error);
      throw new ApplicationError(
        `Failed to save user setting: ${(error as Error).message}`,
      );
    }
  }
}
