# Handoff Técnico - ISSUE-0046 - Retry Automático no useLLM

## Objetivo
Implementar mecanismo de retry automático com backoff exponencial no hook `useLLM`, para maior robustez nas chamadas LLM.

---

## Implementação

### 1. Função utilitária `retryWithBackoff`

- Criada em `src/client/lib/utils.ts`
- Executa uma função assíncrona com tentativas automáticas e backoff exponencial configurável.
- Parâmetros:
  - `fn`: função assíncrona a ser executada
  - `maxRetries`: número máximo de tentativas (default 3)
  - `initialDelay`: delay inicial em ms (default 500)
  - `backoffFactor`: fator multiplicador do delay (default 2)
- Lança o último erro se todas as tentativas falharem.

---

### 2. Alterações no hook `useLLM`

- Local: `src/client/hooks/use-llm.ts`
- Nova interface `UseLLMConfig` para configuração do retry:
  ```ts
  export interface UseLLMConfig {
    maxRetries?: number;
    initialDelay?: number;
    backoffFactor?: number;
  }
  ```
- O hook agora aceita um segundo parâmetro opcional `config: UseLLMConfig`.
- O método `executeOperation` usa `retryWithBackoff` com os parâmetros configuráveis.
- Retry aplicado automaticamente em todas as operações assíncronas do hook (`loadModel`, `generate`, etc).

---

## Configuração

Exemplo de uso com configuração customizada:

```ts
const llm = useLLM(bridge, {
  maxRetries: 5,
  initialDelay: 1000,
  backoffFactor: 2,
});
```

---

## Pontos de atenção

- **Dependências ausentes**: 
  - `Prompt` (`../../core/domain/entities/prompt`)
  - `StreamChunk` (`../../core/domain/entities/stream-chunk`)
  - `ILlmBridge` (`../../core/domain/ports/llm-bridge.port`)
- Essas dependências não foram encontradas e geram erros de compilação.
- Recomenda-se criar ou ajustar esses tipos/interfaces em uma issue separada.

---

## Clean Code & Arquitetura

- Código modular, limpo e testável.
- Retry desacoplado via utilitário reutilizável.
- Configurações injetáveis, respeitando princípios SOLID.
- Funções pequenas e com responsabilidade única.

---

## Status

✅ Retry automático implementado e integrado ao hook `useLLM`.

⚠️ Ajustes pendentes nas dependências ausentes.
