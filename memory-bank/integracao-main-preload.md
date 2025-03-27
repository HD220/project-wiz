# Integração com main.ts e preload.ts

Para completar a implementação do serviço node-llama-cpp, precisamos garantir que a integração com os arquivos `main.ts` e `preload.ts` esteja correta. Vamos analisar as modificações necessárias em cada um desses arquivos.

## Modificações em main.ts

O arquivo `main.ts` já contém uma implementação básica para iniciar o worker e estabelecer a comunicação via MessagePort. No entanto, precisamos garantir que o caminho do worker esteja correto e que a comunicação seja estabelecida adequadamente.

```typescript
// Trecho relevante do main.ts
const workerPath = path.join(__dirname, "llama-worker.js");

const llamaServiceProcess = utilityProcess.fork(workerPath, [], {
  serviceName: "llama-worker",
});

llamaServiceProcess.postMessage("port", [port1]);

port1.on("message", (data) => {
  console.log("main", data);
});

mainWindow.webContents.postMessage("port", [], [port2]);
```

### Modificações Necessárias:

1. **Ajustar o caminho do worker**: Garantir que o caminho aponte para o arquivo correto após a compilação.
2. **Melhorar o tratamento de mensagens**: Adicionar logs mais detalhados para depuração.
3. **Gerenciar o ciclo de vida do worker**: Garantir que o worker seja encerrado quando a aplicação for fechada.

```typescript
// Implementação melhorada
const workerPath = path.join(__dirname, "llama", "llama-worker.js");

const llamaServiceProcess = utilityProcess.fork(workerPath, [], {
  serviceName: "llama-worker",
});

// Configurar comunicação com o worker
const { port1, port2 } = new MessageChannelMain();
llamaServiceProcess.postMessage("port", [port1]);

// Melhorar logs para depuração
port1.on("message", (data) => {
  console.log(
    "[LlamaService]",
    typeof data === "string" ? data : data.type || "Mensagem sem tipo"
  );
});

// Enviar o port2 para o renderer
mainWindow.webContents.postMessage("llama-worker-port", null, [port2]);

// Gerenciar ciclo de vida
app.on("before-quit", () => {
  llamaServiceProcess.kill();
});
```

## Modificações em preload.ts

O arquivo `preload.ts` já implementa a interface `LlamaAPI` definida em `electronAPI.d.ts` e estabelece a comunicação com o worker via MessagePort. No entanto, há algumas inconsistências que precisam ser corrigidas.

```typescript
// Trecho relevante do preload.ts
const { port1: llamaAPI, port2: llamaService } = new MessageChannel();

// Enviar o port2 para o processo principal
ipcRenderer.postMessage("llama-worker-port", null, [llamaService]);
```

### Modificações Necessárias:

1. **Corrigir a recepção do MessagePort**: O preload deve receber o port do processo principal, não criar um novo.
2. **Garantir que todos os métodos da interface LlamaAPI estejam implementados corretamente**.
3. **Melhorar o tratamento de erros e eventos**.

```typescript
// Implementação melhorada
let llamaAPI: MessagePort | null = null;

// Receber o port do processo principal
ipcRenderer.on("llama-worker-port", (event) => {
  llamaAPI = event.ports[0];
  setupLlamaAPI();
});

function setupLlamaAPI() {
  if (!llamaAPI) return;

  // Configurar a API do Llama
  const electronAPI: { llm: LlamaAPI } = {
    llm: {
      // Implementação dos métodos...
    },
  };

  // Expor a API para o renderer
  contextBridge.exposeInMainWorld("electronAPI", electronAPI);
}
```

## Configuração do Vite para Compilação

Para garantir que o worker seja compilado corretamente, precisamos configurar o Vite para incluir o arquivo `llama-worker.ts` na compilação.

### Modificações em vite.worker.config.mts

```typescript
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist/main",
    lib: {
      entry: "src/core/llama/llama-worker.ts",
      formats: ["cjs"],
      fileName: () => "llama/llama-worker.js",
    },
    rollupOptions: {
      external: ["electron", "node-llama-cpp", "path", "fs"],
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
```

## Considerações Finais

Com essas modificações, teremos uma integração completa entre o serviço node-llama-cpp, o processo principal do Electron e o renderer. A comunicação será estabelecida via MessagePorts, e a interface será compatível com a definida em `electronAPI.d.ts`.

Pontos importantes a considerar:

1. **Tratamento de Erros**: Garantir que erros sejam tratados adequadamente em todos os níveis.
2. **Ciclo de Vida**: Garantir que recursos sejam liberados quando a aplicação for fechada.
3. **Desempenho**: Monitorar o desempenho da aplicação, especialmente durante operações intensivas como carregamento de modelos e geração de texto.
4. **Compatibilidade**: Testar a compatibilidade com diferentes sistemas operacionais e versões do Electron.
