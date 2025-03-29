import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLLM } from "../use-llm";
import { LlamaAPIErrorCode } from "../../../core/llama/llama-errors";

interface LlamaHandlers {
  onModelLoaded?: (modelInfo: any) => void;
  onProgress?: (data: any) => void;
  onCompletionChunk?: (chunk: string) => void;
  onCompletionDone?: (data: any) => void;
  onError?: (error: any) => void;
  onDownloadProgress?: (requestId: string, progress: number) => void;
  onDownloadComplete?: (requestId: string, filePath: string) => void;
  onDownloadError?: (requestId: string, error: string) => void;
}

// Mock do electronAPI e MessagePort
const mockElectronAPI = {
  requestLlamaPort: vi.fn(),
  sendToLlamaWorker: vi.fn(),
  setupLlamaHandlers: vi.fn((handlers: LlamaHandlers) => vi.fn()),
};

const mockMessagePort = {
  postMessage: vi.fn(),
  start: vi.fn(),
  onmessage: null as ((this: MessagePort, ev: MessageEvent) => any) | null,
};

beforeEach(() => {
  global.window.electronAPI = mockElectronAPI;
  mockElectronAPI.setupLlamaHandlers.mockClear();
  mockElectronAPI.sendToLlamaWorker.mockClear();
  mockMessagePort.postMessage.mockClear();
});

describe("useLLM", () => {
  it("deve inicializar corretamente e configurar handlers", () => {
    const { result } = renderHook(() => useLLM());

    expect(mockElectronAPI.requestLlamaPort).toHaveBeenCalled();
    expect(mockElectronAPI.setupLlamaHandlers).toHaveBeenCalled();

    // Simular porta pronta
    act(() => {
      window.dispatchEvent(new Event("llama-port-ready"));
    });

    expect(result.current.state.isPortReady).toBe(true);
  });

  it("deve lidar com comunicação básica - inicialização do LLM", async () => {
    const { result } = renderHook(() => useLLM());

    // Simular porta pronta
    act(() => {
      window.dispatchEvent(new Event("llama-port-ready"));
    });

    // Testar initLLM
    await act(async () => {
      result.current.actions.initLLM({ debug: true });
    });

    expect(mockElectronAPI.sendToLlamaWorker).toHaveBeenCalledWith({
      type: "init",
      options: { debug: true },
    });
  });

  it("deve lidar com streaming de respostas", async () => {
    const { result } = renderHook(() => useLLM());

    // Configurar mock handlers
    const handlers: LlamaHandlers = {};
    mockElectronAPI.setupLlamaHandlers.mockImplementation(
      (h: LlamaHandlers) => {
        Object.assign(handlers, h);
        return vi.fn();
      }
    );

    renderHook(() => useLLM());

    // Simular porta pronta
    act(() => {
      window.dispatchEvent(new Event("llama-port-ready"));
    });

    // Testar generateCompletion com streaming
    await act(async () => {
      result.current.actions.generateCompletion("Test prompt", {
        streamResponse: true,
      });
    });

    // Simular chunk de resposta
    act(() => {
      handlers.onCompletionChunk("Chunk 1");
      handlers.onCompletionChunk("Chunk 2");
    });

    expect(result.current.state.completionOutput).toBe("Chunk 1Chunk 2");

    // Simular conclusão
    act(() => {
      handlers.onCompletionDone({
        fullText: "Complete text",
        stats: {
          totalTokens: 10,
          evaluationTime: 1000,
          tokensPerSecond: 10,
        },
      });
    });

    expect(result.current.state.completionOutput).toBe("Complete text");
    expect(result.current.state.stats).toEqual({
      totalTokens: 10,
      evaluationTime: 1000,
      tokensPerSecond: 10,
    });
  });

  it("deve lidar com tratamento de erros", async () => {
    const { result } = renderHook(() => useLLM());

    // Configurar mock handlers com tipagem explícita
    const handlers: LlamaHandlers = {};
    mockElectronAPI.setupLlamaHandlers.mockImplementation(
      (h: LlamaHandlers) => {
        Object.assign(handlers, h);
        return vi.fn();
      }
    );

    renderHook(() => useLLM());

    // Simular erro de inicialização
    act(() => {
      handlers.onError({ code: LlamaAPIErrorCode.InitializationFailed });
    });

    expect(result.current.state.error).toEqual({
      message: "Falha na inicialização do modelo",
      code: LlamaAPIErrorCode.InitializationFailed,
    });
    expect(result.current.state.workerStatus).toBe("error");

    // Simular erro genérico
    act(() => {
      handlers.onError("Erro genérico");
    });

    expect(result.current.state.error).toEqual({
      message: "Erro genérico",
    });
  });

  it("deve lidar com cancelamento de operações", async () => {
    const { result } = renderHook(() => useLLM());

    // Configurar mock handlers
    const handlers = {};
    mockElectronAPI.setupLlamaHandlers.mockImplementation((h) => {
      Object.assign(handlers, h);
      return vi.fn();
    });

    renderHook(() => useLLM());

    // Simular porta pronta
    act(() => {
      window.dispatchEvent(new Event("llama-port-ready"));
    });

    // Iniciar geração
    await act(async () => {
      result.current.actions.generateCompletion("Test prompt");
    });

    // Cancelar operação
    await act(async () => {
      result.current.actions.abort();
    });

    expect(mockElectronAPI.sendToLlamaWorker).toHaveBeenCalledWith({
      type: "abort",
    });
    expect(result.current.state.error).toEqual({
      message: "Operação cancelada",
      code: LlamaAPIErrorCode.Aborted,
    });
    expect(result.current.state.isGenerating).toBe(false);
  });

  it("deve lidar com download de modelos", async () => {
    const { result } = renderHook(() => useLLM());

    // Configurar mock handlers com tipagem explícita
    const handlers: LlamaHandlers = {};
    mockElectronAPI.setupLlamaHandlers.mockImplementation(
      (h: LlamaHandlers) => {
        Object.assign(handlers, h);
        return vi.fn();
      }
    );

    renderHook(() => useLLM());

    // Simular porta pronta
    act(() => {
      window.dispatchEvent(new Event("llama-port-ready"));
    });

    // Iniciar download
    let downloadPromise;
    await act(async () => {
      downloadPromise = result.current.actions.startDownload("model-1");
    });

    expect(result.current.state.isDownloading).toBe(true);

    // Simular progresso
    act(() => {
      handlers.onDownloadProgress("request-1", 0.5);
    });

    expect(result.current.state.downloadProgress).toBe(0.5);

    // Simular conclusão
    act(() => {
      handlers.onDownloadComplete("request-1", "/path/to/model");
    });

    await expect(downloadPromise).resolves.toBe("/path/to/model");
    expect(result.current.state.isDownloading).toBe(false);
    expect(result.current.state.downloadProgress).toBe(1);
  });
});
