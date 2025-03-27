# Plano de Integração ModelCard com LlamaWorker

## Objetivo

Integrar o componente ModelCard com o módulo LlamaWorker para gerenciar downloads de modelos, mostrando progresso e permitindo cancelamento. Além disso, refatorar o ModelCard para utilizar o hook **useLLM** para centralizar o gerenciamento de estado e dos handlers de download.

## Tarefas

### 1. Modificações no useLLM

- **Adicionar estados** no hook:
  ```typescript
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  ```
- **Implementar handlers** para download e cancelamento:

  ```typescript
  const startDownload = (modelId: string) => {
    setIsDownloading(true);
    // Inicia o download utilizando electronAPI.llm.downloadModel
    window.electronAPI.llm.downloadModel(modelId, (progress: number) => {
      setDownloadProgress(Math.round(progress * 100));
    });
  };

  const cancelDownload = () => {
    window.electronAPI.llm.abortDownload();
    setIsDownloading(false);
    // Pode-se resetar o progresso, se necessário
    setDownloadProgress(0);
  };
  ```

- **Expor essas funções** do hook através do objeto retornado, junto com os estados:
  ```typescript
  return {
    state: { download: downloadProgress, isDownloading, ... },
    actions: { initLLM, loadModel, createContext, generateCompletion, generateChatCompletion, abort, startDownload, cancelDownload }
  };
  ```

### 2. Atualização do ModelCard

- **Uso do hook useLLM** no ModelCard:
  - Importar o hook:
    ```typescript
    import { useLLM } from "@/client/hooks/use-llm";
    ```
  - Extração dos handlers e estados:
    ```typescript
    const {
      state: llmState,
      actions: { startDownload, cancelDownload },
    } = useLLM();
    ```
- **Atualizar os handlers no ModelCard**:
  - A função de download agora chamará:
    ```typescript
    const handleDownload = async () => {
      startDownload(model.modelId);
    };
    ```
  - A função de cancelamento será:
    ```typescript
    const handleCancel = async () => {
      cancelDownload();
    };
    ```
- **Exibir o progresso de download**:
  - Na área onde o botão de "Download" é renderizado, utilizar os estados do hook:
    ```tsx
    {
      isDownloading && (
        <div className="relative">
          <Progress value={downloadProgress} className="h-2 w-full" />
          <Button onClick={handleCancel}>Cancelar</Button>
        </div>
      );
    }
    ```
- **Remover estados e funções duplicadas** localmente no ModelCard que agora são gerenciados pelo hook useLLM.

## Fluxo de Trabalho

1. O usuário inicia o download clicando no botão "Download" no ModelCard.
2. O ModelCard chama a função `startDownload(model.modelId)` obtida do hook **useLLM**.
3. O hook utiliza `window.electronAPI.llm.downloadModel`, atualizando `downloadProgress` e `isDownloading` conforme o progresso.
4. A UI do ModelCard é atualizada em tempo real para refletir o progresso do download.
5. Se o usuário desejar cancelar, o ModelCard chama `cancelDownload()` via handler do hook, interrompendo o processo e atualizando o estado.

## Testes

- **Fluxo de download completo:** Verificar se o download é iniciado e o progresso é exibido corretamente.
- **Atualização da UI:** Validar que a UI é atualizada em tempo real conforme o progresso.
- **Cancelamento:** Testar se a função de cancelamento interrompe o download e reseta o estado adequadamente.
- **Tratamento de erros:** Verificar se erros são tratados e exibidos via toast.
