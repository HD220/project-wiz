/// <reference types="@types/jest" />

import { WorkerService } from "../../services/llm/WorkerService";
import { ModelDownloaderOptions, LLamaChatPromptOptions } from "node-llama-cpp";

// Mock do Electron
jest.mock("electron", () => ({
  ipcMain: {
    handle: jest.fn(),
    listeners: jest.fn().mockReturnValue([]),
  },
  app: {
    whenReady: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn(),
    on: jest.fn(),
  },
  BrowserWindow: jest.fn(),
}));

// Mock do WorkerService
const mockDownloadModel = jest.fn();
const mockPromptMethod = jest.fn();
jest.mock("../../services/llm/WorkerService", () => ({
  WorkerService: jest.fn().mockImplementation(() => ({
    downloadModel: mockDownloadModel,
    prompt: mockPromptMethod,
  })),
}));

describe("Worker IPC Handlers", () => {
  let ipcMain: { handle: jest.Mock; listeners: jest.Mock };
  let app: { whenReady: jest.Mock };

  beforeAll(() => {
    // Importa os mocks
    const electron = require("electron");
    ipcMain = electron.ipcMain;
    app = electron.app;

    // Configura o mock do whenReady
    app.whenReady.mockImplementation(() => Promise.resolve());

    require("../../main"); // Importa o main.ts para registrar os handlers
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should register download-model handler", () => {
    expect(ipcMain.handle).toHaveBeenCalledWith(
      "download-model",
      expect.any(Function)
    );
  });

  test("should register send-prompt handler", () => {
    expect(ipcMain.handle).toHaveBeenCalledWith(
      "send-prompt",
      expect.any(Function)
    );
  });

  test("download-model handler should work correctly", async () => {
    // Configura o mock do handler
    const mockHandler = jest.fn();
    ipcMain.handle.mockImplementation((channel, handler) => {
      if (channel === "download-model") mockHandler.mockImplementation(handler);
    });

    require("../../main"); // Reimporta para registrar os handlers

    const mockOptions: ModelDownloaderOptions = {
      modelUrl: "https://example.com/model.bin",
      dirPath: "./models",
    };
    mockDownloadModel.mockResolvedValue("/path/to/model");

    const result = await mockHandler({} as any, mockOptions);

    expect(mockDownloadModel).toHaveBeenCalledWith(mockOptions);
    expect(result).toEqual({
      success: true,
      modelPath: "/path/to/model",
    });
  });

  test("send-prompt handler should work correctly", async () => {
    // Configura o mock do handler
    const mockHandler = jest.fn();
    ipcMain.handle.mockImplementation((channel, handler) => {
      if (channel === "send-prompt") mockHandler.mockImplementation(handler);
    });

    require("../../main"); // Reimporta para registrar os handlers

    const mockPromptText = "Test prompt";
    mockPromptMethod.mockResolvedValue("Test response");

    const result = await mockHandler({} as any, {
      prompt: mockPromptText,
    });

    expect(mockPromptMethod).toHaveBeenCalledWith(mockPromptText, undefined);
    expect(result).toEqual({
      success: true,
      response: "Test response",
    });
  });
});
