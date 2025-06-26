# Tarefa: QSYS-2.1 - Implementar InMemoryJobEventEmitter

**ID da Tarefa:** `QSYS-2.1`
**Título Breve:** Implementar `InMemoryJobEventEmitter`
**Descrição Completa:**
Implementar a classe `InMemoryJobEventEmitter` em `src_refactored/infrastructure/events/in-memory-job-event-emitter.ts`. Esta classe será a implementação inicial do `JobEventEmitter` (definido no design doc, Seção 4.4 e 6.1), utilizando o `EventEmitter` nativo do Node.js para um sistema de pub/sub de eventos de jobs em memória.

---

**Status:** `Pendente`
**Dependências (IDs):** ``
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P1`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/qsys-2.1-inmemory-event-emitter`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Classe `InMemoryJobEventEmitter` criada e herda/utiliza `require('events').EventEmitter`.
- Expõe métodos `on()`, `off()`, `emit()`, `once()` etc., compatíveis com a interface `EventEmitter`.
- Permite a emissão e subscrição de `JobEventType`s definidos (ex: `job.added`, `job.completed`).
- Os eventos emitidos incluem `queueName`, `jobId` e dados específicos do evento como argumentos para os listeners, conforme o design.
- Testes unitários para verificar a funcionalidade básica de subscrição, emissão e remoção de listeners.

---

## Notas/Decisões de Design
- Esta é uma implementação simples para o contexto de um único processo (Electron main process).
- Garantir que os tipos de eventos e os formatos de payload estejam alinhados com `docs/technical-documentation/bullmq-inspired-queue-system.md` (Seção 6.2).
- Considerar se a classe deve ser um singleton ou instanciada e injetada. Para um sistema de eventos global, um singleton gerenciado por DI é comum.

---

## Comentários
- `(YYYY-MM-DD por @Jules): Tarefa criada como parte do novo plano de implementação do sistema de filas.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
