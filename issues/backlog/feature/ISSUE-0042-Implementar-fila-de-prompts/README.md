# Implementar fila de prompts no WorkerService

## Descrição

Implementar uma fila de prompts no `WorkerService` para evitar sobrecarga do sistema. A fila deve enfileirar os prompts recebidos, processá-los em ordem e ter um limite máximo de tamanho.

## Critérios de Aceitação

- [ ] Os prompts recebidos são enfileirados.
- [ ] Os prompts são processados na ordem em que foram recebidos (FIFO).
- [ ] A fila tem um tamanho máximo configurável.
- [ ] O sistema não fica sobrecarregado com um grande número de prompts.
- [ ] O `WorkerService` continua funcionando corretamente após a implementação da fila.

## Tarefas

- [ ] Implementar a fila de prompts no `WorkerService`.
- [ ] Adicionar um mecanismo para configurar o tamanho máximo da fila.
- [ ] Implementar tratamento de erros caso a fila esteja cheia.
- [ ] Adicionar testes unitários para a fila de prompts.
- [ ] Integrar a fila de prompts com o restante do sistema.

## Notas Adicionais

O `WorkerService` está localizado em `src/core/services/llm/WorkerService.ts`.
