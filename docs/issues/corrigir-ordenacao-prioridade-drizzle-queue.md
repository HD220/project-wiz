# Corrigir ordenação por prioridade no DrizzleQueueRepository

**Descrição**:
Atualmente a ordenação de jobs por prioridade no DrizzleQueueRepository está incorreta porque trata a prioridade como string ao invés de número.

**Tarefas**:
1. Modificar a query SQL para ordenar numericamente por priority
2. Atualizar o método getNextJob para usar ordenação numérica correta
3. Adicionar teste unitário que verifique a ordenação correta

**Critérios de Aceitação**:
- [x] Jobs devem ser ordenados corretamente por prioridade (1-10)
- [x] Teste deve verificar ordenação com prioridades mistas
- [x] Deve manter compatibilidade com a interface existente
- [x] Adicionados índices compostos para otimizar queries frequentes
- [x] Implementados testes de concorrência para múltiplos workers
- [x] Adicionados edge cases para ordenação (prioridades iguais, valores padrão)

**Detalhes da Implementação**:
- Índices adicionados:
  - queue_status_priority_idx: (queueId, status, priority)
  - status_updated_at_idx: (status, updatedAt)
  - delayed_until_status_idx: (delayedUntil, status)
  - started_at_status_idx: (startedAt, status)
- Estratégia de ordenação:
  - Prioridade numérica (CAST(opts->>'priority' AS INTEGER))
  - FIFO para jobs com mesma prioridade (usando updatedAt)
  - Valor padrão para prioridade não especificada (0)

**Arquivos envolvidos**:
- `src/infrastructure/repositories/drizzle/queue.repository.ts`
- `src/infrastructure/queue/queue.integration.spec.ts`

**Detalhes técnicos**:
- Prioridade é armazenada como número no campo `opts.priority` (JSON)
- Atualmente a ordenação é feita como string (`->>` operator)
- Deve ser alterado para ordenação numérica (CAST AS INTEGER ou equivalente)
- Testes devem criar jobs com prioridades variadas (1, 5, 10, 2) e verificar ordem

**Referências**:
- Entidade Job define prioridade como número (1-10): `src/core/domain/entities/jobs/job.entity.ts`
- Interface IQueueRepository: `src/core/ports/repositories/iqueue-repository.interface.ts`