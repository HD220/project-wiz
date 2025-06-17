// Configuração de testes para Vitest
import { fileURLToPath } from "url";
import path from "path";
import { vi, type Mock } from "vitest";

// Configuração correta de aliases usando import.meta.url
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuração de aliases de módulo

// Tipos e mocks globais
interface IpcRendererMethods {
  invoke: Mock;
  send: Mock;
  on: Mock;
  removeListener: Mock;
}

interface IpcMainMethods {
  handle: Mock;
  on: Mock;
  removeListener: Mock;
}

interface ElectronMockType {
  ipcRenderer: IpcRendererMethods;
  ipcMain: IpcMainMethods;
}

export const electronMock: ElectronMockType = {
  ipcRenderer: {
    invoke: vi.fn(),
    send: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
};

export const testUtils = {
  resetMocks: () => {
    vi.resetAllMocks();
    electronMock.ipcRenderer.invoke.mockReset();
    electronMock.ipcRenderer.send.mockReset();
    electronMock.ipcRenderer.on.mockReset();
    electronMock.ipcRenderer.removeListener.mockReset();
    electronMock.ipcMain.handle.mockReset();
    electronMock.ipcMain.on.mockReset();
    electronMock.ipcMain.removeListener.mockReset();
  },
};

// Configuração global para Vitest
vi.stubGlobal("electron", electronMock);
vi.stubGlobal("testUtils", testUtils);

// Configuração de módulos para Vitest
vi.mock("electron", () => electronMock);
