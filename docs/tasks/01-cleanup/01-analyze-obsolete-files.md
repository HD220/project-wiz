# Tarefa Pai: Analisar diretórios e identificar arquivos obsoletos

## Descrição:

Esta tarefa pai coordena a análise de vários diretórios e arquivos para identificar quais componentes da implementação anterior do sistema de agentes (que utilizava BullMQ) são obsoletos e devem ser removidos, conforme definido na ADR-005.

## Contexto:

Esta é a primeira tarefa no processo de migração para a nova arquitetura baseada em Drizzle ORM (ADR-004). É crucial identificar corretamente os arquivos obsoletos para garantir que apenas o código irrelevante seja removido nas etapas subsequentes, preservando quaisquer utilitários ou componentes genéricos que ainda possam ser úteis. Esta tarefa foi decomposta em sub-tarefas mais granulares para analisar cada parte do código legado.

## Sub-tarefas:

Esta tarefa pai é composta pelas seguintes sub-tarefas:

- [01.01.01 - Analisar diretório src/core/domain/entities/job para arquivos obsoletos](01-analyze-obsolete-files/01-analyze-job-entities.md)
- [01.01.02 - Analisar diretório src/core/domain/entities/worker para arquivos obsoletos](01-analyze-obsolete-files/02-analyze-worker-entities.md)
- [01.01.03 - Analisar diretório src/core/domain/entities/queue para arquivos obsoletos](01-analyze-obsolete-files/03-analyze-queue-entities.md)
- [01.01.04 - Analisar diretório src/core/application/use-cases/job para arquivos obsoletos](01-analyze-obsolete-files/04-analyze-job-usecases.md)
- [01.01.05 - Analisar arquivo src/infrastructure/services/queue.service.ts para obsolescência](01-analyze-obsolete-files/05-analyze-queue-service-file.md)
- [01.01.06 - Analisar arquivo src/infrastructure/services/worker-assignment.service.ts para obsolescência](01-analyze-obsolete-files/06-analyze-worker-assignment-service-file.md)
- [01.01.07 - Analisar arquivo src/infrastructure/services/child-process-worker-pool.service.ts para obsolescência](01-analyze-obsolete-files/07-analyze-child-process-worker-pool-service-file.md)
- [01.01.08 - Analisar arquivo src/infrastructure/repositories/job-drizzle.repository.ts para obsolescência](01-analyze-obsolete-files/08-analyze-job-repository-file.md)
- [01.01.09 - Analisar arquivo src/infrastructure/repositories/worker-drizzle.repository.ts para obsolescência](01-analyze-obsolete-files/09-analyze-worker-repository-file.md)
- [01.01.10 - Analisar arquivo src/infrastructure/workers/job-processor.worker.ts para obsolescência](01-analyze-obsolete-files/10-analyze-job-processor-worker-file.md)
- [01.01.11 - Analisar diretórios de teste correspondentes para arquivos obsoletos](01-analyze-obsolete-files/11-analyze-test-directories.md)
- [01.01.12 - Consolidar lista final de arquivos obsoletos](01-analyze-obsolete-files/12-consolidate-obsolete-files-list.md)

## Expected Deliverable:

A conclusão de todas as sub-tarefas listadas acima, resultando em uma lista consolidada de arquivos obsoletos a serem excluídos.
