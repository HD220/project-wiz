import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import {
  SaveUserSettingCommand,
  SaveUserSettingCommandHandler,
} from "@/main/modules/user-settings/application/commands/save-user-setting.command";
import {
  GetUserSettingQuery,
  GetUserSettingQueryHandler,
} from "@/main/modules/user-settings/application/queries/get-user-setting.query";
import {
  ListUserSettingsQuery,
  ListUserSettingsQueryHandler,
} from "@/main/modules/user-settings/application/queries/list-user-settings.query";
import { UserSetting } from "@/main/modules/user-settings/domain/user-setting.entity";
import { DrizzleUserSettingsRepository } from "@/main/modules/user-settings/persistence/drizzle-user-settings.repository";

function registerUserSettingsHandlers(
  cqrsDispatcher: CqrsDispatcher,
  userSettingsRepository: DrizzleUserSettingsRepository,
  saveUserSettingCommandHandler: SaveUserSettingCommandHandler,
  getUserSettingQueryHandler: GetUserSettingQueryHandler,
  listUserSettingsQueryHandler: ListUserSettingsQueryHandler,
) {
  cqrsDispatcher.registerCommandHandler<SaveUserSettingCommand, UserSetting>(
    "SaveUserSettingCommand",
    saveUserSettingCommandHandler.handle.bind(saveUserSettingCommandHandler),
  );
  cqrsDispatcher.registerQueryHandler<
    GetUserSettingQuery,
    UserSetting | undefined
  >(
    "GetUserSettingQuery",
    getUserSettingQueryHandler.handle.bind(getUserSettingQueryHandler),
  );
  cqrsDispatcher.registerQueryHandler<ListUserSettingsQuery, UserSetting[]>(
    "ListUserSettingsQuery",
    listUserSettingsQueryHandler.handle.bind(listUserSettingsQueryHandler),
  );
}

export function initializeUserSettings(cqrsDispatcher: CqrsDispatcher) {
  const userSettingsRepository = new DrizzleUserSettingsRepository();
  const saveUserSettingCommandHandler = new SaveUserSettingCommandHandler(
    userSettingsRepository,
  );
  const getUserSettingQueryHandler = new GetUserSettingQueryHandler(
    userSettingsRepository,
  );
  const listUserSettingsQueryHandler = new ListUserSettingsQueryHandler(
    userSettingsRepository,
  );

  registerUserSettingsHandlers(
    cqrsDispatcher,
    userSettingsRepository,
    saveUserSettingCommandHandler,
    getUserSettingQueryHandler,
    listUserSettingsQueryHandler,
  );
}
