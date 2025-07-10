import type { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { createIpcHandler } from "@/main/kernel/ipc-handler-utility";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import type { IUserSetting } from "@/shared/ipc-types/domain-types";
import type {
  IpcUserSettingsSavePayload,
  IpcUserSettingsGetPayload,
  IpcUserSettingsListPayload,
} from "@/shared/ipc-types/ipc-payloads";
import { SaveUserSettingCommand, SaveUserSettingCommandHandler } from "./application/commands/save-user-setting.command";
import { GetUserSettingQuery, GetUserSettingQueryHandler } from "./application/queries/get-user-setting.query";
import { ListUserSettingsQuery, ListUserSettingsQueryHandler } from "./application/queries/list-user-settings.query";
import { DrizzleUserSettingsRepository } from "./persistence/drizzle-user-settings.repository";
import { db } from "@/main/persistence/db";

export function registerUserSettingsModule(cqrsDispatcher: CqrsDispatcher) {
  const userSettingsRepository = new DrizzleUserSettingsRepository(db);
  const saveUserSettingCommandHandler = new SaveUserSettingCommandHandler(
    userSettingsRepository,
  );
  const getUserSettingQueryHandler = new GetUserSettingQueryHandler(
    userSettingsRepository,
  );
  const listUserSettingsQueryHandler = new ListUserSettingsQueryHandler(
    userSettingsRepository,
  );

  cqrsDispatcher.registerCommandHandler<SaveUserSettingCommand, IUserSetting>(
    SaveUserSettingCommand.name,
    saveUserSettingCommandHandler.handle.bind(saveUserSettingCommandHandler),
  );
  cqrsDispatcher.registerQueryHandler<GetUserSettingQuery, IUserSetting | undefined>(
    GetUserSettingQuery.name,
    getUserSettingQueryHandler.handle.bind(getUserSettingQueryHandler),
  );
  cqrsDispatcher.registerQueryHandler<ListUserSettingsQuery, IUserSetting[]>(
    ListUserSettingsQuery.name,
    listUserSettingsQueryHandler.handle.bind(listUserSettingsQueryHandler),
  );

  createIpcHandler<IpcUserSettingsSavePayload, IUserSetting>(
    IpcChannel.USER_SETTINGS_SAVE,
    cqrsDispatcher,
    async (payload) => {
      const setting = (await cqrsDispatcher.dispatchCommand(
        new SaveUserSettingCommand(payload),
      )) as IUserSetting;
      return setting;
    },
  );

  createIpcHandler<IpcUserSettingsGetPayload, IUserSetting | undefined>(
    IpcChannel.USER_SETTINGS_GET,
    cqrsDispatcher,
    async (payload) => {
      const setting = (await cqrsDispatcher.dispatchQuery(
        new GetUserSettingQuery(payload),
      )) as IUserSetting | undefined;
      return setting;
    },
  );

  createIpcHandler<IpcUserSettingsListPayload, IUserSetting[]>(
    IpcChannel.USER_SETTINGS_LIST,
    cqrsDispatcher,
    async (payload) => {
      const settings = (await cqrsDispatcher.dispatchQuery(
        new ListUserSettingsQuery(payload),
      )) as IUserSetting[];
      return settings;
    },
  );
}
