/// <reference types="@types/jest" />

import { WorkerService } from "../../services/llm/WorkerService";
import { ModelDownloaderOptions, LLamaChatPromptOptions } from "node-llama-cpp";

// Mock do Electron

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
let app: { getPath: jest.Mock; whenReady: jest.Mock };
  

  beforeAll(() => {
    jest.mock('electron', () => require('../../__mocks__/electron').default);
jest.mock('electron', () => require('../../__mocks__/electron').default);

    (require('electron').app.whenReady as jest.Mock).mockImplementation(() => Promise.resolve());
    // Importa os mocks
    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks    // Importa os mocks
    
    
    
    
    // Importa os mocks
    
    
    
    // Importa os mocks
    
    // Importa os mocks
    
    
    // Importa os mocks
    
    // Importa os mocks
    
    
    

    // Configura o mock do whenReady
    const electron = require('electron');
    const { app } = electron;
    const { ipcMain } = electron;
    (app.whenReady as jest.Mock).mockImplementation(() => Promise.resolve());

    require("../../main"); // Importa o main.ts para registrar os handlers
  });

  afterEach(() => {
    jest.clearAllMocks();
const electron = require('electron');
    const { ipcMain } = electron;

  });

  test("should register download-model handler", () => {

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    
const electron = require('electron');
    const { ipcMain } = electron;
    expect(ipcMain.handle).toHaveBeenCalledWith(
      "download-model",
      expect.any(Function)
    );

    

    

  });

  test("should register send-prompt handler", () => {

    
const electron = require('electron');
    const { ipcMain } = electron;

    
    expect(ipcMain.handle).toHaveBeenCalledWith(
      "send-prompt",
      expect.any(Function)
    );
  });


    

    

  test("download-model handler should work correctly", async () => {
    // Configura o mock do handler
    const mockHandler = jest.fn();

    

    


    
    

    

    

    
    
    
    
    

    

    
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
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

    

    

    

    
    
    

    

    
    
    

    

    

    

    

    

    
const electron = require('electron');
    const { ipcMain } = electron;

    
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;
const electron = require('electron');
    const { ipcMain } = electron;

    
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






