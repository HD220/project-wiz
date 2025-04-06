# Implementar suporte a cancelamento de requisições LLM

## Descrição

Implementar funcionalidade para cancelar requisições LLM em andamento, incluindo um botão de cancelar e limpeza do estado da requisição.

## Componentes afetados

- `useLLM` hook (src/client/hooks/use-llm.ts)
- `WorkerService` (src/core/services/llm/WorkerService.ts)

## Requisitos

- Permitir cancelar a requisição atual.
- Incluir um botão de cancelar na interface do usuário.
- Limpar o estado da requisição ao cancelar.
