# Implementar streaming de respostas

## Descrição

Implementar o streaming de respostas do LLM para exibir a resposta em tempo real, utilizando Server-Sent Events (SSE) ou WebSockets. Incluir um indicador de carregamento.

## Critérios de Aceitação

- [ ] A resposta do LLM é exibida em tempo real.
- [ ] Utiliza Server-Sent Events (SSE) ou WebSockets para o streaming.
- [ ] Possui um indicador de carregamento durante o streaming.

## Tarefas

- [ ] Implementar o streaming no backend (WorkerService).
- [ ] Implementar a lógica de exibição no frontend (useLLM hook).
- [ ] Adicionar um indicador de carregamento na interface do usuário.

## Notas Adicionais

Considerar a utilização de SSE para uma implementação mais simples, caso seja suficiente.
