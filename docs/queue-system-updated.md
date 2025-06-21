# Sistema de Filas - Project Wiz

## Visão Geral da Arquitetura

O sistema de filas do Project Wiz foi projetado seguindo os princípios da Clean Architecture, com separação clara entre:

- **Camada de Domínio**: Contém as entidades principais ([`Job`](src/core/domain/entities/jobs/job.entity.ts) e [`Queue`](src/core/domain/entities/queue/queue.entity.ts)) e o serviço de worker ([`WorkerService`](src/core/domain/services/worker.service.ts))
- **Camada de Aplicação**: Define as interfaces de contrato ([`IQueueRepository`](src/core/ports/repositories/iqueue-repository.interface.ts) e [`IProcessor`](src/core/ports/queue/iprocessor.interface.ts))
- **Camada de Infraestrutura**: Implementa os adaptadores concretos ([`DrizzleQueueRepository`](src/infrastructure/repositories/drizzle/queue.repository.ts))

## Tratamento de Valores Nulos

O sistema implementa validações robustas para valores nulos/undefined:

- **Queue**: 
  - `save()` valida se a queue é nula e se possui ID
  - `getNextJob()` verifica campos obrigatórios do job retornado
- **Job**:
  - Todos os métodos validam parâmetros obrigatórios
  - Campos opcionais são explicitamente marcados como `| null` ou `| undefined`

### Erros Esperados

| Código de Erro     | Descrição                     | Causa Provável                      |
| ------------------ | ----------------------------- | ----------------------------------- |
| QUEUE_NULL         | Queue não pode ser nula       | Parâmetro não fornecido             |
| QUEUE_ID_NULL      | ID da queue não pode ser nulo | Queue não inicializada corretamente |
| JOB_NULL           | Job não pode ser nulo         | Tentativa de adicionar job inválido |
| JOB_ID_NULL        | ID do job não pode ser nulo   | Job mal formado                     |
| TRANSACTION_FAILED | Falha na transação            | Problema no banco de dados          |

[Restante do conteúdo original mantido...]