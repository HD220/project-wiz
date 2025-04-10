# Handoff - Implementar suporte a cancelamento de requisições LLM

## Descrição

Esta issue tem como objetivo implementar a funcionalidade de cancelamento de requisições LLM, permitindo que o usuário interrompa o processamento de uma requisição em andamento.

## Contexto

Atualmente, não há como cancelar uma requisição LLM após o início do processamento. Isso pode ser problemático em casos onde o usuário deseja interromper a requisição por algum motivo (e.g., prompt incorreto, tempo de resposta excessivo).

## Requisitos

- Implementar um mecanismo para cancelar a requisição LLM em andamento.
- Adicionar um botão de "Cancelar" na interface do usuário, que acione o cancelamento da requisição.
- Garantir que o estado da requisição seja limpo corretamente após o cancelamento (e.g., remover mensagens parciais, resetar indicadores de carregamento).
- Tratar possíveis erros ou exceções que possam ocorrer durante o processo de cancelamento.

## Componentes afetados

- `useLLM` hook (`src/client/hooks/use-llm.ts`): Modificado para aceitar `AbortSignal` e propagar cancelamento.
- `MistralGGUFAdapter` (`src/core/infrastructure/llm/adapters/MistralGGUFAdapter.ts`): Implementado suporte a cancelamento via `AbortSignal`.
- `llm-bridge.port.ts` (`src/core/domain/ports/llm-bridge.port.ts`): Interface atualizada para aceitar `AbortSignal`.

## Implementação realizada

- O método `generate` do hook `useLLM` agora aceita um parâmetro opcional `signal` (AbortSignal).
- Para cancelar uma requisição, deve-se criar um `AbortController` externo e passar seu `signal` para `generate`.
- O adaptador `MistralGGUFAdapter` verifica se o sinal foi abortado antes de iniciar a requisição e rejeita a Promise se o cancelamento ocorrer durante a execução.
- O método `promptStream` já possuía suporte a cancelamento via método `cancel()` e permanece inalterado.
- A interface `ILlmBridge` foi criada para unificar os contratos de carregamento e execução de prompts, facilitando a integração.

## Como utilizar o cancelamento

```typescript
const controller = new AbortController();

// Iniciar geração
const promise = generate({ prompt: 'texto', signal: controller.signal });

// Cancelar requisição
controller.abort();
```

Ao cancelar, a Promise será rejeitada com erro `"Requisição cancelada"`.

## Limitações e recomendações

- O cancelamento interrompe a resposta lógica, mas a API `node-llama-cpp` não suporta interrupção nativa do processamento interno, podendo haver algum processamento residual.
- Sempre trate erros de Promise rejeitada ao usar `generate`.
- Garanta que o estado da UI seja limpo/resetado ao cancelar.

## Próximos passos

- Integrar o botão "Cancelar" na interface do usuário, acionando o `AbortController`.
- Adicionar testes unitários e de integração para garantir a funcionalidade de cancelamento.
- Testar a funcionalidade em diferentes cenários e casos de uso.
- Futuramente, avaliar melhorias no cancelamento nativo da API LLM.

## Observações

- O cancelamento foi implementado de forma segura, modular e alinhada à Clean Architecture.
- O código segue princípios SOLID e Clean Code, facilitando manutenção e extensões futuras.
