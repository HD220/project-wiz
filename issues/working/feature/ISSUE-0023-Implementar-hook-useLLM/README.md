# Implementar hook useLLM

## Descrição

Implementar o hook `useLLM` para fornecer uma interface React para interação com o WorkerService que gerencia modelos LLM.

## Contexto

Atualmente o hook existe apenas como um esqueleto vazio em `src/client/hooks/use-llm.ts`, enquanto o WorkerService já está implementado no backend. Precisamos criar uma ponte entre o frontend React e o serviço backend.

## Requisitos

- [ ] Integrar com WorkerService via IPC
- [ ] Fornecer API limpa para componentes React
- [ ] Implementar estados de loading/error
- [ ] Adicionar tipagem TypeScript adequada
- [ ] Documentar o hook e seus métodos
- [ ] Incluir testes básicos

## API Proposta

```typescript
interface UseLLMReturn {
  // Estados
  isLoading: boolean;
  error: Error | null;

  // Métodos
  loadModel(modelId: string): Promise<void>;
  unloadModel(): Promise<void>;
  generate(prompt: string, options?: GenerateOptions): Promise<string>;
  getLoadedModel(): string | null;
  getAvailableModels(): Promise<string[]>;

  // Configurações
  setOptions(options: ModelOptions): void;
}

type GenerateOptions = {
  temperature?: number;
  maxTokens?: number;
  // ... outros parâmetros
};

type ModelOptions = {
  // opções de configuração do modelo
};
```

## Tarefas

1. Definir interface TypeScript completa
2. Implementar comunicação IPC com WorkerService
3. Gerenciar estados de loading/error
4. Escrever documentação JSDoc
5. Criar testes básicos

## Critérios de Aceitação

- [ ] Hook pode carregar/descarregar modelos
- [ ] Hook pode gerar texto a partir de prompts
- [ ] Estados de loading/error são gerenciados corretamente
- [ ] Documentação completa disponível
- [ ] Testes cobrem casos básicos de uso
