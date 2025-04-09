# Handoff - Documentar testes do WorkerService

## Contexto

Foram implementados testes robustos para o `WorkerService`, cobrindo a inicialização, carregamento/descarga de modelos, envio de prompts, tratamento de erros e diferentes tipos de modelos.

## Descrição da tarefa

Corrigir os testes no arquivo `src/core/__tests__/WorkerService.test.ts` seguindo as correções detalhadas no arquivo `issues/working/documentation/ISSUE-0102-Documentar-testes-WorkerService/test-corrections.md`. As correções incluem:

*   Alterar o `expect` nos testes `should load a model` e `should load a mistral model` para verificar apenas o final do caminho do `worker-bridge`.
*   Ajustar o mock do `requestResponse` no teste `should send a prompt` para retornar o valor correto.

## Localização dos testes

Os testes foram implementados no arquivo `src/core/__tests__/WorkerService.test.ts`.

## Current Status

Após várias tentativas, os testes `should load a model` e `should load a mistral model` continuam falhando. Aparentemente, o mock do `electron.utilityProcess.fork` não está funcionando corretamente e a mensagem "loadModel" nunca é enviada para o processo worker.

## Problems

*   Os testes `should load a model` e `should load a mistral model` continuam falhando.
*   O mock do `electron.utilityProcess.fork` pode não estar funcionando corretamente.
*   A simulação do recebimento da mensagem do worker pode estar incorreta.
*   O mock do `ipcManagerMock.requestResponse` pode não estar sendo chamado com os argumentos corretos.

## Next Steps

*   Investigar o mock do `electron.utilityProcess.fork` e garantir que ele está configurado corretamente para simular o envio de mensagens para o processo principal.
*   Verificar a simulação do recebimento da mensagem do worker e garantir que ela está sendo feita no momento correto.
*   Verificar o mock do `ipcManagerMock.requestResponse` e garantir que ele está sendo chamado com os argumentos corretos.
*   Considerar a utilização de uma abordagem diferente para testar o `WorkerService`, como a utilização de testes de integração.

## Relevant Code

```typescript
// src/core/__tests__/WorkerService.test.ts
import { WorkerService } from "../services/llm/WorkerService";
import { IPCManager } from "../services/llm/ipc";
import { BrowserWindow, App, IpcMain, UtilityProcess, MessageChannelMain } from 'electron';
import { EventEmitter } from "stream";

jest.mock("../services/llm/ipc");
jest.mock('electron', () => {
  const electron = {
    BrowserWindow: jest.fn().mockImplementation(() => {
      const loadURL = jest.fn();
      const on = jest.fn();
      const webContents = {
        openDevTools: jest.fn(),
      };
      return {
        loadURL,
        on,
        webContents,
      };
    }) as any,
    app: {
      on: jest.fn(),
      getPath: jest.fn(),
    } as any,
    ipcMain: {
      on: jest.fn(),
      handle: jest.fn(),
      removeHandler: jest.fn(),
    } as any,
    utilityProcess: {
      fork: jest.fn().mockReturnValue({
        postMessage: jest.fn(),
        on: jest.fn().mockImplementation((event, listener) => {
          console.log('utilityProcess.fork.on chamado com:', event, typeof event);
          if (event === 'message') {
            // Simula o recebimento de uma mensagem do worker
            console.log('Simulando mensagem do worker:', { type: 'loadModel', success: true });
            listener({ type: 'loadModel', success: true });
          }
        }),
        kill: jest.fn(),
      } as any),
    },
    MessageChannelMain: jest.fn(() => {
      return {
        port1: {
          start: jest.fn(),
          postMessage: jest.fn(),
          on: jest.fn(),
          close: jest.fn(),
        },
        port2: {
          start: jest.fn(),
          postMessage: jest.fn(),
          on: jest.fn(),
          close: jest.fn(),
        },
      };
    }) as any,
  };
  return electron;
});

describe("WorkerService", () => {
  let workerService: WorkerService;
  let ipcManagerMock: IPCManager;

  beforeEach(() => {
    ipcManagerMock = {
      listeners: new EventEmitter(),
      port: {
        postMessage: jest.fn(),
        on: jest.fn(),
        start: jest.fn(),
        close: jest.fn(),
      },
      pendingRequests: new Map<string, (value: any) => void>(),
      requestResponse: jest.fn().mockResolvedValue({ response: "This is a test response." }),
      _onMessage: jest.fn(),
      respond: jest.fn(),
      _onClose: jest.fn(),
      removeAllListeners: jest.fn(),
    } as any;
    (IPCManager as jest.Mock).mockImplementation(() => ipcManagerMock);
    workerService = new WorkerService();
    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
  });

  it("should create a WorkerService instance", () => {
    expect(workerService).toBeInstanceOf(WorkerService);
  });

  it("should load a model", async () => {
    const modelOptions = {
      modelPath: "path/to/model",
      modelType: "llama",
    };

    const electron = require('electron');

    const result = await workerService.loadModel({...modelOptions, modelId: 'test', modelType: 'llama'});

    expect(electron.utilityProcess.fork).toHaveBeenCalled();
    expect(electron.utilityProcess.fork).toHaveBeenCalledWith(
      expect.stringContaining("worker-bridge.ts"),
      [],
      { stdio: "inherit" }
    );
    expect(ipcManagerMock.requestResponse).toHaveBeenCalledWith("loadModel", modelOptions);
    expect(result).toEqual({ success: true });
  });

  it("should load a mistral model", async () => {
    const modelOptions = {
      modelPath: "path/to/mistral/model",
      modelType: "mistral",
    };

    const electron = require('electron');

    const result = await workerService.loadModel({...modelOptions, modelId: 'test', modelType: 'mistral'});

    expect(electron.utilityProcess.fork).toHaveBeenCalled();
    expect(electron.utilityProcess.fork).toHaveBeenCalledWith(
      expect.stringContaining("worker-bridge.ts"),
      [],
      { stdio: "inherit" }
    );
    expect(ipcManagerMock.requestResponse).toHaveBeenCalledWith("loadModel", modelOptions);
    expect(result).toEqual({ success: true });
  });

  it("should unload a model", async () => {
    const modelOptions = {
      modelPath: "path/to/model",
    };

    const result = await workerService.unloadModel(modelOptions);

    expect(ipcManagerMock.requestResponse).toHaveBeenCalledWith("unloadModel", modelOptions);
    expect(result).toEqual({ response: "This is a test response." });
  });

  it("should send a prompt", async () => {
    const prompt = "This is a test prompt.";
    const options = { temperature: 0.7 };

    const result = await workerService.prompt(prompt, options);

    expect(result).toEqual({ response: "This is a test response." });
    expect(ipcManagerMock.requestResponse).toHaveBeenCalledWith("prompt", { prompt: 'This is a test prompt.', options: { temperature: 0.7 } });
  });

  it("should create a context", async () => {
    const options = { contextSize: 2048 };
    const result = await workerService.createContext(options);
    expect(ipcManagerMock.requestResponse).toHaveBeenCalledWith("createContext", options);
    expect(result).toEqual({ response: "This is a test response." });
  });

  it("should download a model", async () => {
    const options = { modelUrl: "http://example.com/model.bin" };
    const result = await workerService.downloadModel(options);
    expect(ipcManagerMock.requestResponse).toHaveBeenCalledWith("downloadModel", options);
    expect(result).toEqual({ response: "This is a test response." });
  });

  it("should save prompts", async () => {
    const options = { modelId: "model1", prompts: { prompt1: "value1" } };
    const result = await workerService.savePrompts(options);
    expect(ipcManagerMock.requestResponse).toHaveBeenCalledWith("savePrompts", options);
    expect(result).toEqual({ response: "This is a test response." });
  });

  it("should load prompts", async () => {
    const options = { modelId: "model1" };
    const result = await workerService.loadPrompts(options);
    expect(ipcManagerMock.requestResponse).toHaveBeenCalledWith("loadPrompts", options);
    expect(result).toEqual({ response: "This is a test response." });
  });
});