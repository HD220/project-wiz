# ISSUE-0049: Implementar streaming no WorkerService

## Descrição

Modificar o `WorkerService` para enviar os dados do LLM em tempo real, utilizando Server-Sent Events (SSE) ou WebSockets. Isso permitirá exibir a resposta do LLM em tempo real para o usuário, melhorando a experiência de uso.

## Requisitos

- Implementar a comunicação em tempo real entre o `WorkerService` e o frontend, utilizando SSE ou WebSockets.
- Exibir a resposta do LLM em tempo real na interface do usuário.
- Adicionar um indicador de carregamento enquanto a resposta do LLM está sendo gerada.
- Considerar o tratamento de erros e a reconexão em caso de falhas na conexão.

## Prioridade

Alta

## Status

Backlog
