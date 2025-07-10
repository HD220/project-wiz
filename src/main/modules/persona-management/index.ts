import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { ipcMain } from "electron";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import { IPersona } from "@/shared/ipc-types/domain-types";
import {
  IpcPersonaRefineSuggestionPayload,
  IpcPersonaRefineSuggestionResponse,
  IpcPersonaCreatePayload,
  IpcPersonaCreateResponse,
  IpcPersonaListPayload,
  IpcPersonaListResponse,
  IpcPersonaRemovePayload,
  IpcPersonaRemoveResponse,
} from "@/shared/ipc-types/ipc-payloads";
import { RefinePersonaSuggestionCommand } from "./application/commands/refine-persona-suggestion.command";
import { CreatePersonaCommand } from "./application/commands/create-persona.command";
import { ListPersonasQuery } from "./application/queries/list-personas.query";
import { RemovePersonaCommand } from "./application/commands/remove-persona.command";

export function registerPersonaManagementModule(
  cqrsDispatcher: CqrsDispatcher,
) {
  ipcMain.handle(
    IpcChannel.PERSONA_REFINE_SUGGESTION,
    async (
      _,
      payload: IpcPersonaRefineSuggestionPayload,
    ): Promise<IpcPersonaRefineSuggestionResponse> => {
      try {
        const result = (await cqrsDispatcher.dispatchCommand(
          new RefinePersonaSuggestionCommand(payload),
        )) as IPersona;
        return { success: true, data: result };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );

  ipcMain.handle(
    IpcChannel.PERSONA_CREATE,
    async (
      _,
      payload: IpcPersonaCreatePayload,
    ): Promise<IpcPersonaCreateResponse> => {
      try {
        const persona = (await cqrsDispatcher.dispatchCommand(
          new CreatePersonaCommand(payload),
        )) as IPersona;
        return { success: true, data: persona };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );

  ipcMain.handle(
    IpcChannel.PERSONA_LIST,
    async (
      _,
      payload: IpcPersonaListPayload,
    ): Promise<IpcPersonaListResponse> => {
      try {
        const personas = (await cqrsDispatcher.dispatchQuery(
          new ListPersonasQuery(payload),
        )) as IPersona[];
        return { success: true, data: personas };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );

  ipcMain.handle(
    IpcChannel.PERSONA_REMOVE,
    async (
      _,
      payload: IpcPersonaRemovePayload,
    ): Promise<IpcPersonaRemoveResponse> => {
      try {
        const result = (await cqrsDispatcher.dispatchCommand(
          new RemovePersonaCommand(payload),
        )) as boolean;
        return { success: true, data: result };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );
}
