# Plano de Integração ModelCard com LlamaWorker

## Objetivo

Integrar o componente ModelCard com o módulo LlamaWorker para gerenciar downloads de modelos, mostrando progresso e permitindo cancelamento. Além disso, refatorar o ModelCard para utilizar o hook **useLLM** para centralizar o gerenciamento de estado e dos handlers de download.

## Tarefas

### 1. Criação do Wrapper para LlamaWorker

- **Implementação do wrapper**:

  ```typescript
  export interface LlamaCoreInterface {
    initialize(options: any): Promise<void>;
    loadModel(modelPath: string, options: any): Promise<void>;
    createContext(): Promise<void>;
    downloadModel(
      modelId: string,
      modelUrl: string,
      outputPath: string
    ): Promise<void>;
    abort(): Promise<void>;
  }

  export class LlamaWrapper {
    private core: LlamaCoreInterface;

    constructor(core: LlamaCoreInterface) {
      this.core = core;
    }

    public async processMessage(message: any): Promise<any> {
      // Processa mensagens recebidas via MessagePort
      // e invoca os métodos correspondentes
    }
  }
  ```

### 2. Modificações no useLLM

- **Adicionados estados** no hook:
  ```typescript
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  ```
- **Implementados handlers** para download e cancelamento:

  ```typescript
  const startDownload = useCallback((modelId: string) => {
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadError(null);

    window.electronAPI.llm
      .downloadModel(modelId, (progress: number) => {
        setDownloadProgress(progress);
      })
      .then(() => {
        setIsDownloading(false);
        // Atualizar o estado para refletir que o download foi concluído
      })
      .catch((error) => {
        setIsDownloading(false);
        setDownloadError(error.message);
      });
  }, []);

  const cancelDownload = useCallback(() => {
    window.electronAPI.llm
      .abortDownload()
      .then(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      })
      .catch((error) => {
        console.error("Erro ao cancelar download:", error);
        setDownloadError("Falha ao cancelar o download");
      });
  }, []);
  ```

- **Exposição dessas funções** do hook através do objeto retornado:
  ```typescript
  return {
    state: {
      ...state,
      downloadProgress,
      isDownloading,
      downloadError,
    },
    actions: {
      initLLM,
      loadModel,
      createContext,
      generateCompletion,
      generateChatCompletion,
      abort,
      startDownload,
      cancelDownload,
    },
  };
  ```

### 3. Atualização do ModelCard

- **Uso do hook useLLM** no ModelCard:
  - Importação do hook:
    ```typescript
    import { useLLM } from "../hooks/use-llm";
    ```
  - Extração dos handlers e estados:
    ```typescript
    const {
      state: { downloadProgress, isDownloading },
      actions: { startDownload, cancelDownload },
    } = useLLM();
    ```
- **Atualização dos handlers no ModelCard**:
  - A função de download agora chama:
    ```typescript
    const handleDownload = () => {
      try {
        startDownload(model.modelId);
        toast.success(`Iniciando download do modelo ${model.modelId}`);
      } catch (error: any) {
        console.error("Erro ao iniciar download:", error);
        toast.error(`Falha ao iniciar o download do modelo ${model.modelId}`);
      }
    };
    ```
  - A função de cancelamento é:
    ```typescript
    const handleCancelDownload = () => {
      try {
        cancelDownload();
        toast.info(`Download do modelo ${model.modelId} cancelado`);
      } catch (error) {
        console.error("Erro ao cancelar download:", error);
        toast.error("Falha ao cancelar o download");
      }
    };
    ```

### 4. Atualização da Interface ElectronAPI

- **Definição da interface LlamaAPI**:
  ```typescript
  export interface LlamaAPI {
    // Métodos existentes
    init(options?: { ... }): void;
    loadModel(modelPath: string, options?: { ... }): void;
    createContext(): void;
    generateCompletion(...): void;
    generateChatCompletion(...): void;

    // Novos métodos
    downloadModel(
      modelId: string,
      progressCallback: (progress: number) => void
    ): Promise<void>;

    abortDownload(): Promise<void>;

    abort(): void;

    // Event handlers
    onModelLoaded(callback: (modelInfo: any) => void): () => void;
    onProgress(callback: (data: any) => void): () => void;
    onCompletionChunk(callback: (chunk: string) => void): () => void;
    onCompletionDone(callback: (data: any) => void): () => void;
    onError(callback: (data: any) => void): () => void;
  }
  ```

### 5. Implementação do Preload

- **Comunicação via MessageChannel**:

  ```typescript
  const { port1: llamaAPI, port2: llamaService } = new MessageChannel();

  // Enviar o port2 para o processo principal
  ipcRenderer.postMessage("llama-worker-port", null, [llamaService]);
  ```

- **Implementação do método downloadModel**:
  ```typescript
  downloadModel: (modelId, progressCallback) => {
    return new Promise<void>((resolve, reject) => {
      const requestId = Date.now().toString();

      // Configurar handlers para progresso, conclusão e erro
      const handleProgress = (event: MessageEvent) => {
        const data = event.data;
        if (data.type === "download_progress" && data.requestId === requestId) {
          progressCallback(data.progress);
        }
      };

      // Adicionar event listeners
      llamaAPI.addEventListener("message", handleProgress);
      // ... outros event listeners

      // Enviar mensagem para iniciar o download
      llamaAPI.postMessage({
        type: "download_model",
        modelId,
        requestId,
      });
    });
  };
  ```

## Fluxo de Trabalho

1. O usuário inicia o download clicando no botão "Download" no ModelCard.
2. O ModelCard chama a função `startDownload(model.modelId)` obtida do hook **useLLM**.
3. O hook utiliza `window.electronAPI.llm.downloadModel`, que se comunica com o LlamaWorker via MessageChannel.
4. O LlamaWorker processa a mensagem através do wrapper e inicia o download.
5. O progresso é enviado de volta via MessageChannel, atualizando `downloadProgress` e `isDownloading` no hook.
6. A UI do ModelCard é atualizada em tempo real para refletir o progresso do download.
7. Se o usuário desejar cancelar, o ModelCard chama `cancelDownload()` via handler do hook, interrompendo o processo e atualizando o estado.

## Testes

- **Fluxo de download completo:** Verificar se o download é iniciado e o progresso é exibido corretamente.
- **Atualização da UI:** Validar que a UI é atualizada em tempo real conforme o progresso.
- **Cancelamento:** Testar se a função de cancelamento interrompe o download e reseta o estado adequadamente.
- **Tratamento de erros:** Verificar se erros são tratados e exibidos via toast.

## Implementação Atual

A implementação atual segue uma abordagem simplificada, mas estruturada para permitir futuras extensões sem necessidade de refatoração profunda. A comunicação via MessageChannel permite uma separação clara entre a interface do usuário e o processamento em background, enquanto o hook useLLM centraliza a lógica de estado e as operações relacionadas ao LLM.
