# Implementação de Download de Modelos com Progresso

## 1. Visão Geral

Implementar funcionalidade de download de modelos LLM com exibição de progresso, permitindo:

- Download de modelos com feedback visual
- Cancelamento de downloads em andamento
- Tratamento de erros e retentativas
- Validação de integridade dos arquivos

## 2. Arquivos Envolvidos

### Frontend

- `src/client/components/model-card.tsx`: Interface principal
- `src/client/components/ui/progress.tsx`: Componente de barra de progresso
- `src/client/components/ui/toast.tsx`: Notificações

### Backend

- `src/core/llama/download.ts`: Lógica de download
- `src/core/main.ts`: IPC handlers
- `src/core/preload.ts`: Expoe API para renderer

### Tipagens

- `typings/electronAPI.d.ts`: Definição de tipos

## 3. Alterações Necessárias

### ModelCard (src/client/components/model-card.tsx)

```typescript
// Adicionar estados
const [downloadProgress, setDownloadProgress] = useState(0);
const [isDownloading, setIsDownloading] = useState(false);

// Handler de download
const handleDownload = async () => {
  try {
    setIsDownloading(true);
    window.electronAPI.downloadModel(model.modelId, (progress) => {
      setDownloadProgress(progress);
    });
    // ... tratamento de sucesso
  } catch (error) {
    // ... tratamento de erros
  } finally {
    setIsDownloading(false);
  }
};

// UI de progresso
{
  isDownloading && (
    <div className="flex items-center gap-2 w-full">
      <Progress value={downloadProgress} />
      <span>{downloadProgress}%</span>
    </div>
  );
}
```

### download.ts (src/core/llama/download.ts)

```typescript
export async function modelDownload({
  uri,
  onProgress,
}: {
  uri: string;
  onProgress?: (progress: number) => void;
}) {
  // Verificar espaço em disco
  // Iniciar download
  // Enviar progresso via callback
  // Validar arquivo baixado
}
```

### main.ts (src/core/main.ts)

```typescript
ipcMain.handle("download-model", async (event, modelId) => {
  // Implementar lógica de download
  // Enviar progresso via IPC
});
```

### preload.ts (src/core/preload.ts)

```typescript
contextBridge.exposeInMainWorld("electronAPI", {
  downloadModel: (modelId, onProgress) =>
    ipcRenderer.invoke("download-model", modelId, onProgress),
});
```

### electronAPI.d.ts

```typescript
interface ElectronAPI {
  downloadModel: (
    modelId: string,
    onProgress: (progress: number) => void
  ) => Promise<void>;
}
```

## 4. Fluxo Completo

### Início do Download

1. Usuário clica em "Download"
2. ModelCard envia modelo selecionado via IPC
3. Main process valida espaço em disco
4. Inicia download via node-llama-cpp

### Durante o Download

5. Progresso é enviado via IPC
6. ModelCard atualiza barra de progresso
7. Exibe porcentagem atual

### Finalização

8. Download concluído
9. Valida integridade do arquivo
10. Atualiza status do modelo
11. Exibe toast de sucesso

### Tratamento de Erros

12. Verifica conexão com internet
13. Trata falhas de download
14. Exibe toast de erro
15. Permite retentativa

## 5. Dependências

- node-llama-cpp: Download de modelos
- Progress (shadcn/ui): Exibição de progresso
- Toast (shadcn/ui): Notificações
- IPC: Comunicação entre processos

## 6. Testes Necessários

- Download bem sucedido
- Cancelamento de download
- Falha de espaço em disco
- Perda de conexão
- Validação de arquivo corrompido
