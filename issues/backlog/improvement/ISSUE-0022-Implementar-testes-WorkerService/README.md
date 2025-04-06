# Implementar testes para WorkerService

## Descrição

Implementar testes de integração para o WorkerService seguindo a estratégia de testes do projeto. O WorkerService é responsável pela comunicação com o worker process que executa os modelos LLM.

## Contexto

O WorkerService está implementado mas sem cobertura de testes adequada. Isso representa um risco para a estabilidade do sistema, especialmente considerando a complexidade da integração com LLMs.

## Tarefas

1. Criar testes para todos os handlers IPC:

   - worker:initialize
   - worker:loadModel
   - worker:createContext
   - worker:initializeSession
   - worker:prompt
   - worker:unloadModel
   - worker:downloadModel

2. Implementar testes para os métodos públicos:

   - downloadModel
   - prompt

3. Testar comportamento de limpeza de memória:

   - trackModelUsage
   - cleanupOldModels
   - startMemoryMonitoring (indiretamente)

4. Seguir padrões existentes em worker.integration.test.ts

## Critérios de Aceitação

- [ ] 100% dos handlers IPC testados
- [ ] 100% dos métodos públicos testados
- [ ] Testes de comportamento de memória implementados
- [ ] Cobertura mínima de 70% para a classe WorkerService
- [ ] Testes seguem padrão de worker.integration.test.ts existente
- [ ] Incluir testes de erro e edge cases

## Exemplo de Implementação

```typescript
describe("WorkerService", () => {
  let workerService: WorkerService;

  beforeEach(() => {
    workerService = new WorkerService();
  });

  describe("downloadModel", () => {
    it("should initiate model download", async () => {
      const options = { repo: "test/repo", file: "model.gguf" };
      const result = await workerService.downloadModel(options);

      expect(result).toHaveProperty("status");
      expect(result.status).toBe("started");
    });

    it("should reject invalid download options", async () => {
      await expect(workerService.downloadModel({} as any)).rejects.toThrow(
        "Invalid download options"
      );
    });
  });

  describe("IPC Handlers", () => {
    it("should handle initialize operation", async () => {
      const response = await ipcMain.handle("worker:initialize", {
        gpuLayers: 20,
      });
      expect(response).toHaveProperty("success", true);
    });
  });
});
```

## Referências

- [Estratégia de Testes](/docs/testing-strategy.md)
- [WorkerService.ts](/src/core/services/llm/WorkerService.ts)
- [worker.integration.test.ts](/src/core/__tests__/integration/worker.integration.test.ts)
