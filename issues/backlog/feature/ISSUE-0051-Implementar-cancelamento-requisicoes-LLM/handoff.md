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

- `useLLM` hook (src/client/hooks/use-llm.ts): Modificar o hook para incluir a lógica de cancelamento da requisição.
- `WorkerService` (src/core/services/llm/WorkerService.ts): Modificar o serviço para suportar o cancelamento da requisição.
- Interface do usuário: Adicionar o botão de "Cancelar" e integrar com a lógica de cancelamento.

## Observações

- Considerar o uso de `AbortController` para implementar o cancelamento da requisição.
- Garantir que o cancelamento da requisição não cause efeitos colaterais indesejados (e.g., vazamento de memória, inconsistência de dados).
- Documentar o código e as decisões de implementação.

## Próximos passos

- Implementar as modificações necessárias nos componentes afetados.
- Adicionar testes unitários e de integração para garantir a funcionalidade de cancelamento.
- Testar a funcionalidade em diferentes cenários e casos de uso.
