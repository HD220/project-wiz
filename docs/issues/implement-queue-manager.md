# Implementar Queue Manager

## Descrição
Implementar o gerenciador de filas responsável por controlar o ciclo de vida das jobs, incluindo persistência, transições de status e dependências.

## Requisitos Funcionais
- [ ] Persistir jobs no banco de dados (SQLite)
- [ ] Gerenciar transições de status (waiting → executing → success/failed)
- [ ] Implementar sistema de dependências entre jobs
- [ ] Fornecer API para:
  - Adicionar novas jobs
  - Recuperar jobs prontas para execução
  - Atualizar status
- [ ] Implementar políticas de retentativa automática

## Componentes Envolvidos
- `Job` (core/domain/entities/job.entity.ts)
- `QueueManager` (infrastructure/services/queue-manager.service.ts)
- `JobRepository` (infrastructure/repositories/job.repository.ts)

## Critérios de Aceitação
- [ ] Jobs podem ser adicionadas e recuperadas da fila
- [ ] Status é atualizado corretamente
- [ ] Dependências entre jobs são respeitadas
- [ ] Retentativas seguem política configurada
- [ ] Testes unitários cobrindo fluxos principais

## Relação com Casos de Uso
- [Add Job to Queue](./../use-cases/add-job-to-queue.md)
- [Process Job](./../use-cases/process-job.md)
- [Retry Failed Job](./../use-cases/retry-failed-job.md)