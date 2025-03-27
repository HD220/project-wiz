# Implementação do llama-worker.ts

## Estrutura do Arquivo

```typescript
import { MessagePortMain } from "electron";
import path from "path";
import fs from "fs";
import { AbortController } from "node:abort-controller";

// Tipos de mensagens que o worker pode receber
enum MessageType {
  INIT = "init",
  LOAD_MODEL = "load_model",
  CREATE_CONTEXT = "create_context",
  GENERATE_COMPLETION = "generate_completion",
  GENERATE_CHAT_COMPLETION = "generate_chat_completion",
  DOWNLOAD_MODEL = "download_model",
  ABORT = "abort",
  ABORT_DOWNLOAD = "abort_download",
}

// Tipos de mensagens que o worker pode enviar
enum ResponseType {
  INFO = "info",
  ERROR = "error",
  PROGRESS = "progress",
  COMPLETION_CHUNK = "completion_chunk",
  COMPLETION_DONE = "completion_done",
  MODEL_LOADED = "model_loaded",
  DOWNLOAD_PROGRESS = "download_progress",
  DOWNLOAD_COMPLETE = "download_complete",
  DOWNLOAD_ERROR = "download_error",
}

// Tipos de progresso
enum ProgressType {
  LOAD = "load",
  DOWNLOAD = "download",
  INFERENCE = "inference",
}

class LlamaWorker {
  private llamaInstance: any = null;
  private model: any = null;
  private context: any = null;
  private port: MessagePortMain;
  private abortController: AbortController | null = null;
  private downloadAbortController: AbortController | null = null;

  constructor(port: MessagePortMain) {
    this.port = port;
    this.setupMessageHandlers();
  }

  private setupMessageHandlers() {
    this.port.on("message", async (event) => {
      const message = event.data;
      try {
        await this.handleMessage(message);
      } catch (error: any) {
        this.sendError(error.message, error.stack);
      }
    });
  }

  private async handleMessage(message: any) {
    switch (message.type) {
      case MessageType.INIT:
        await this.initialize(message.options);
        break;
      case MessageType.LOAD_MODEL:
        await this.loadModel(message.modelPath, message.options);
        break;
      case MessageType.CREATE_CONTEXT:
        await this.createContext();
        break;
      case MessageType.GENERATE_COMPLETION:
        await this.generateCompletion(message.prompt, message.options);
        break;
      case MessageType.GENERATE_CHAT_COMPLETION:
        await this.generateChatCompletion(message.messages, message.options);
        break;
      case MessageType.DOWNLOAD_MODEL:
        await this.downloadModel(message.modelId, message.requestId);
        break;
      case MessageType.ABORT:
        this.abort();
        break;
      case MessageType.ABORT_DOWNLOAD:
        this.abortDownload();
        break;
      default:
        this.sendError(`Tipo de mensagem desconhecido: ${message.type}`);
    }
  }

  // Métodos para enviar respostas
  private sendInfo(message: string) {
    this.port.postMessage({ type: ResponseType.INFO, message });
  }

  private sendError(error: string, details?: any) {
    this.port.postMessage({ type: ResponseType.ERROR, error, details });
  }

  private sendProgress(progressType: ProgressType, progress: number) {
    this.port.postMessage({
      type: ResponseType.PROGRESS,
      progressType,
      progress,
    });
  }

  private sendCompletionChunk(chunk: string) {
    this.port.postMessage({
      type: ResponseType.COMPLETION_CHUNK,
      chunk,
    });
  }

  private sendCompletionDone(fullText: string, stats: any) {
    this.port.postMessage({
      type: ResponseType.COMPLETION_DONE,
      fullText,
      stats,
    });
  }

  private sendModelLoaded(modelInfo: any) {
    this.port.postMessage({
      type: ResponseType.MODEL_LOADED,
      modelInfo,
    });
  }

  private sendDownloadProgress(requestId: string, progress: number) {
    this.port.postMessage({
      type: ResponseType.DOWNLOAD_PROGRESS,
      requestId,
      progress,
    });
  }

  private sendDownloadComplete(requestId: string, filePath: string) {
    this.port.postMessage({
      type: ResponseType.DOWNLOAD_COMPLETE,
      requestId,
      filePath,
    });
  }

  private sendDownloadError(requestId: string, error: string) {
    this.port.postMessage({
      type: ResponseType.DOWNLOAD_ERROR,
      requestId,
      error,
    });
  }

  // Implementação dos métodos principais
  private async initialize(options?: any) {
    try {
      this.sendInfo("Inicializando node-llama-cpp...");
      const { getLlama } = await import("node-llama-cpp");
      this.llamaInstance = await getLlama({
        debug: options?.debug || false,
        gpu: options?.gpu || "auto",
        maxThreads: options?.numThreads,
      });
      this.sendInfo("node-llama-cpp inicializado com sucesso");
    } catch (error: any) {
      this.sendError("Falha ao inicializar node-llama-cpp", error.message);
      throw error;
    }
  }

  private async loadModel(modelPath: string, options?: any) {
    if (!this.llamaInstance) {
      throw new Error("node-llama-cpp não inicializado");
    }

    try {
      this.sendInfo(`Carregando modelo: ${modelPath}`);
      this.model = await this.llamaInstance.loadModel({
        modelPath,
        gpuLayers: options?.gpuLayers,
        contextSize: options?.contextSize,
        batchSize: options?.batchSize,
        seed: options?.seed,
        onLoadProgress: (progress: number) => {
          this.sendProgress(ProgressType.LOAD, progress);
        },
      });

      const modelInfo = {
        name: path.basename(modelPath),
        size: fs.statSync(modelPath).size,
        parameters: this.model.params?.nParams || "Desconhecido",
      };

      this.sendProgress(ProgressType.LOAD, 1.0);
      this.sendModelLoaded(modelInfo);
      this.sendInfo("Modelo carregado com sucesso");
    } catch (error: any) {
      this.sendError("Erro ao carregar modelo", error.message);
      throw error;
    }
  }

  private async createContext() {
    if (!this.model) {
      throw new Error("Modelo não carregado");
    }

    try {
      this.sendInfo("Criando contexto...");
      this.abortController = new AbortController();
      this.context = await this.model.createContext();
      this.sendInfo("Contexto criado com sucesso");
    } catch (error: any) {
      this.sendError("Erro ao criar contexto", error.message);
      throw error;
    }
  }

  private async generateCompletion(prompt: string, options?: any) {
    if (!this.context) {
      throw new Error("Contexto não criado");
    }

    try {
      this.sendInfo("Gerando completion...");
      this.abortController = new AbortController();

      let fullText = "";

      await this.context.completion({
        prompt,
        maxTokens: options?.maxTokens || 512,
        temperature: options?.temperature || 0.8,
        topP: options?.topP || 0.95,
        stopSequences: options?.stopSequences || [],
        stream: true,
        signal: this.abortController.signal,
        onToken: (chunk: string) => {
          this.sendCompletionChunk(chunk);
          fullText += chunk;
        },
      });

      this.sendCompletionDone(fullText, {
        promptTokens: prompt.length / 4, // Estimativa simples
        completionTokens: fullText.length / 4, // Estimativa simples
        totalTokens: (prompt.length + fullText.length) / 4, // Estimativa simples
      });

      this.sendInfo("Completion concluída");
    } catch (error: any) {
      if (error.name === "AbortError") {
        this.sendInfo("Geração abortada pelo usuário");
      } else {
        this.sendError("Erro ao gerar completion", error.message);
        throw error;
      }
    }
  }

  private async generateChatCompletion(messages: any[], options?: any) {
    if (!this.context) {
      throw new Error("Contexto não criado");
    }

    try {
      this.sendInfo("Gerando chat completion...");
      this.abortController = new AbortController();

      let fullText = "";

      await this.context.chat({
        messages,
        maxTokens: options?.maxTokens || 512,
        temperature: options?.temperature || 0.8,
        topP: options?.topP || 0.95,
        stopSequences: options?.stopSequences || [],
        stream: true,
        signal: this.abortController.signal,
        onToken: (chunk: string) => {
          this.sendCompletionChunk(chunk);
          fullText += chunk;
        },
      });

      this.sendCompletionDone(fullText, {
        promptTokens: JSON.stringify(messages).length / 4, // Estimativa simples
        completionTokens: fullText.length / 4, // Estimativa simples
        totalTokens: (JSON.stringify(messages).length + fullText.length) / 4, // Estimativa simples
      });

      this.sendInfo("Chat completion concluída");
    } catch (error: any) {
      if (error.name === "AbortError") {
        this.sendInfo("Geração abortada pelo usuário");
      } else {
        this.sendError("Erro ao gerar chat completion", error.message);
        throw error;
      }
    }
  }

  private async downloadModel(modelId: string, requestId: string) {
    try {
      this.sendInfo(`Iniciando download do modelo: ${modelId}`);
      this.downloadAbortController = new AbortController();

      const modelsDir = path.join(process.cwd(), "models");
      if (!fs.existsSync(modelsDir)) {
        fs.mkdirSync(modelsDir, { recursive: true });
      }

      // Determinar a URL do modelo
      let modelUrl: string;
      if (modelId.startsWith("hf://")) {
        const hfPath = modelId.replace("hf://", "");
        modelUrl = `https://huggingface.co/${hfPath}/resolve/main/model.gguf`;
      } else {
        modelUrl = modelId;
      }

      // Usar o módulo de download do node-llama-cpp
      const { downloadModel } = await import("node-llama-cpp");

      await downloadModel({
        url: modelUrl,
        directory: modelsDir,
        signal: this.downloadAbortController.signal,
        onProgress: (progress: number) => {
          this.sendDownloadProgress(requestId, progress);
        },
      });

      const fileName = path.basename(modelUrl);
      const filePath = path.join(modelsDir, fileName);

      this.sendDownloadComplete(requestId, filePath);
      this.sendInfo(`Modelo baixado com sucesso: ${filePath}`);
    } catch (error: any) {
      if (error.name === "AbortError") {
        this.sendInfo("Download abortado pelo usuário");
      } else {
        this.sendDownloadError(requestId, error.message);
        this.sendError("Erro ao baixar modelo", error.message);
      }
    } finally {
      this.downloadAbortController = null;
    }
  }

  private abort() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      this.sendInfo("Operação abortada");
    }
  }

  private abortDownload() {
    if (this.downloadAbortController) {
      this.downloadAbortController.abort();
      this.downloadAbortController = null;
      this.sendInfo("Download abortado");
    }
  }

  public cleanup() {
    this.abort();
    this.abortDownload();

    if (this.context) {
      this.context.dispose();
      this.context = null;
    }

    if (this.model) {
      this.model.dispose();
      this.model = null;
    }

    this.sendInfo("Recursos liberados");
  }
}

// Inicialização do worker
process.parentPort.once("message", async (messageData) => {
  try {
    const [port] = messageData.ports;
    const worker = new LlamaWorker(port);
    port.start();
    port.postMessage("LlamaWorker inicializado e pronto para receber comandos");

    // Configurar limpeza ao encerrar
    process.on("exit", () => worker.cleanup());
    process.on("SIGINT", () => {
      worker.cleanup();
      process.exit(0);
    });
  } catch (error) {
    console.error("LlamaWorker: Erro ao inicializar", error);
    process.exit(1);
  }
});
```

## Explicação da Implementação

### 1. Estrutura Geral

O arquivo `llama-worker.ts` implementa uma classe `LlamaWorker` que:

- Recebe mensagens via MessagePort
- Processa as mensagens e executa as operações correspondentes
- Envia respostas e eventos de progresso de volta para o processo principal

### 2. Tipos de Mensagens

Definimos enums para os tipos de mensagens que o worker pode receber e enviar:

- `MessageType`: Tipos de mensagens que o worker pode receber
- `ResponseType`: Tipos de mensagens que o worker pode enviar
- `ProgressType`: Tipos de progresso que podem ser reportados

### 3. Métodos Principais

#### Inicialização

- `initialize`: Carrega a biblioteca node-llama-cpp
- `loadModel`: Carrega um modelo específico
- `createContext`: Cria um contexto para geração de texto

#### Geração de Texto

- `generateCompletion`: Gera texto a partir de um prompt
- `generateChatCompletion`: Gera respostas de chat a partir de mensagens

#### Download de Modelos

- `downloadModel`: Baixa um modelo usando o módulo de download do node-llama-cpp
- `abortDownload`: Cancela um download em andamento

#### Controle

- `abort`: Aborta uma operação em andamento
- `cleanup`: Libera recursos ao encerrar

### 4. Comunicação

O worker se comunica com o processo principal através de métodos como:

- `sendInfo`: Envia informações gerais
- `sendError`: Envia erros
- `sendProgress`: Envia progresso de operações
- `sendCompletionChunk`: Envia chunks de texto gerado
- `sendCompletionDone`: Envia conclusão da geração
- `sendModelLoaded`: Envia informações do modelo carregado
- `sendDownloadProgress`: Envia progresso de download
- `sendDownloadComplete`: Envia conclusão de download
- `sendDownloadError`: Envia erros de download

## Integração com o Sistema

Este worker será iniciado pelo processo principal do Electron e se comunicará com o renderer através de MessagePorts. A interface exposta pelo preload.ts já está configurada para usar esta implementação.

## Considerações de Implementação

1. **Tratamento de Erros**: Todos os métodos incluem tratamento de erros para garantir que o worker não falhe silenciosamente.

2. **Abortar Operações**: Implementamos suporte para abortar operações em andamento, tanto para geração de texto quanto para downloads.

3. **Progresso**: Reportamos progresso para operações de longa duração como carregamento de modelos e downloads.

4. **Limpeza de Recursos**: Garantimos que todos os recursos sejam liberados ao encerrar o worker.

5. **Compatibilidade com a API**: A implementação é compatível com a interface `LlamaAPI` definida em `electronAPI.d.ts`.
