import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { ipcMain } from "electron";
import {
  IUserSetting,
  IpcUserSettingsSavePayload,
  IpcUserSettingsSaveResponse,
  IpcUserSettingsGetPayload,
  IpcUserSettingsGetResponse,
  IpcUserSettingsListPayload,
  IpcUserSettingsListResponse,
} from "@/shared/ipc-types/entities";
import { SaveUserSettingCommand } from "./application/commands/save-user-setting.command";
import { GetUserSettingQuery } from "./application/queries/get-user-setting.query";
import { ListUserSettingsQuery } from "./application/queries/list-user-settings.query";

export function registerUserSettingsModule(cqrsDispatcher: CqrsDispatcher) {
  ipcMain.handle(
    "user-settings:save",
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
    "user-settings:get",
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
    "user-settings:list",
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
