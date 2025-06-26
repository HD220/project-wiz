# Tarefa: QSYS-5.1 - Configurar Injeção de Dependência para serviços de Fila

**ID da Tarefa:** `QSYS-5.1`
**Título Breve:** Configurar Injeção de Dependência para serviços de Fila
**Descrição Completa:**
Configurar o container de Injeção de Dependência (DI) do projeto (provavelmente InversifyJS, conforme `docs/tecnico/arquitetura.md`) para gerenciar as instâncias e dependências dos novos serviços do sistema de filas (`DrizzleJobRepository`, `InMemoryJobEventEmitter`, `JobQueueService`, `JobWorkerService`, `QueueSchedulerService`).

---

**Status:** `Pendente`
**Dependências (IDs):** `QSYS-1.3, QSYS-2.1, QSYS-2.3, QSYS-3.1, QSYS-4.1`
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P1`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/qsys-5.1-queue-di-setup`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Todas as classes de serviço do sistema de filas (`DrizzleJobRepository`, `InMemoryJobEventEmitter`, `JobQueueService`, `JobWorkerService`, `QueueSchedulerService`) são registradas no container DI.
- Suas dependências (ex: instância do Drizzle, outras interfaces de serviço) são corretamente injetadas.
- As interfaces (ex: `IJobRepository`) são vinculadas às suas implementações concretas.
- O container DI é capaz de resolver e fornecer instâncias funcionais dos serviços de fila.
- A configuração de DI é feita de forma modular, idealmente em um arquivo de configuração específico para o módulo de filas dentro de `src_refactored/infrastructure/ioc/`.

---

## Notas/Decisões de Design
- Seguir o padrão de configuração de DI já estabelecido no projeto, se houver.
- Garantir que escopos de instâncias (singleton, transient, request-scoped) sejam apropriadamente definidos para cada serviço.
    - `DrizzleJobRepository`, `InMemoryJobEventEmitter`, `DrizzleClient` são tipicamente singletons.
    - `JobQueueService` pode ser singleton por nome de fila ou instanciado conforme necessário.
    - `JobWorkerService` será instanciado para cada tipo de worker.
    - `QueueSchedulerService` é tipicamente um singleton.
- Pode ser necessário criar Symbols (identificadores de tipo) para cada interface/serviço a ser injetado.

---

## Comentários
- `(YYYY-MM-DD por @Jules): Tarefa criada como parte do novo plano de implementação do sistema de filas.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
