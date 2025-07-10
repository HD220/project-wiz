import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { ipcMain } from "electron";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import { IUserSetting } from "@/shared/ipc-types/domain-types";
import {
  IpcUserSettingsSavePayload,
  IpcUserSettingsSaveResponse,
  IpcUserSettingsGetPayload,
  IpcUserSettingsGetResponse,
  IpcUserSettingsListPayload,
  IpcUserSettingsListResponse,
} from "@/shared/ipc-types/ipc-payloads";
import { SaveUserSettingCommand } from "./application/commands/save-user-setting.command";
import { GetUserSettingQuery } from "./application/queries/get-user-setting.query";
import { ListUserSettingsQuery } from "./application/queries/list-user-settings.query";

export function registerUserSettingsModule(cqrsDispatcher: CqrsDispatcher) {
  ipcMain.handle(
    IpcChannel.USER_SETTINGS_SAVE,
    async (
      _,
      payload: IpcUserSettingsSavePayload,
    ): Promise<IpcUserSettingsSaveResponse> => {
      try {
        const setting = (await cqrsDispatcher.dispatchCommand(
          new SaveUserSettingCommand(payload),
        )) as IUserSetting;
        return { success: true, data: setting };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );

  ipcMain.handle(
    IpcChannel.USER_SETTINGS_GET,
    async (
      _,
      payload: IpcUserSettingsGetPayload,
    ): Promise<IpcUserSettingsGetResponse> => {
      try {
        const setting = (await cqrsDispatcher.dispatchQuery(
          new GetUserSettingQuery(payload),
        )) as IUserSetting | undefined;
        return { success: true, data: setting };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );

  ipcMain.handle(
    IpcChannel.USER_SETTINGS_LIST,
    async (
      _,
      payload: IpcUserSettingsListPayload,
    ): Promise<IpcUserSettingsListResponse> => {
      try {
        const settings = (await cqrsDispatcher.dispatchQuery(
          new ListUserSettingsQuery(payload),
        )) as IUserSetting[];
        return { success: true, data: settings };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );
}
