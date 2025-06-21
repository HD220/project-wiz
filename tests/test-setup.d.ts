// Declarações de tipo para configuração de testes
import { Mock } from "vitest";

declare global {
  namespace NodeJS {
    interface Global {
      aliases: Record<string, string>;
      electron: {
        ipcRenderer: {
          invoke: Mock;
          send: Mock;
          on: Mock;
          removeListener: Mock;
        };
        ipcMain: {
          handle: Mock;
          on: Mock;
          removeListener: Mock;
        };
      };
      testUtils: {
        resetMocks: () => void;
      };
    }
  }

  declare const aliases: Record<string, string>;
  declare const electron: {
    ipcRenderer: {
      invoke: Mock;
      send: Mock;
      on: Mock;
      removeListener: Mock;
    };
    ipcMain: {
      handle: Mock;
      on: Mock;
      removeListener: Mock;
    };
  };
  declare const testUtils: {
    resetMocks: () => void;
  };
}
