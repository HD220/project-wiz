# Tarefa: QSYS-2.4 - Testes Unitários e de Integração para Fase 2

**ID da Tarefa:** `QSYS-2.4`
**Título Breve:** Testes Unitários e de Integração para Fase 2
**Descrição Completa:**
Escrever testes unitários e de integração para os componentes desenvolvidos na Fase 2: `InMemoryJobEventEmitter`, Casos de Uso de Job (`CreateJobUseCase`, `GetJobUseCase`, etc.), e `JobQueueService`.

---

**Status:** `Pendente`
**Dependências (IDs):** `QSYS-2.1, QSYS-2.2, QSYS-2.3`
**Complexidade (1-5):** `3`
**Prioridade (P0-P4):** `P1`
**Responsável:** `Jules`
**Branch Git Proposta:** `test/qsys-2.4-phase2-tests`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Testes unitários para `InMemoryJobEventEmitter`:
    - Emissão e recebimento de eventos.
    - Remoção de listeners.
- Testes unitários para cada Caso de Uso de Job:
    - Mockar `IJobRepository`.
    - Verificar a lógica de orquestração e a interação correta com o repositório.
    - Validar DTOs de entrada/saída.
- Testes para `JobQueueService`:
    - **Unitários:** Mockar Casos de Uso/`IJobRepository` e `JobEventEmitter`. Testar a lógica de cada método da API (add, getJob, etc.) e se os eventos corretos são emitidos.
    - **Integração:** Testar `JobQueueService` com uma instância real (ou em memória) do `DrizzleJobRepository` e `InMemoryJobEventEmitter` para validar o fluxo de ponta a ponta da adição e recuperação de jobs.
- Alta cobertura de código para os componentes da Fase 2.

---

## Notas/Decisões de Design
- Utilizar Vitest.
- Para testes de integração do `JobQueueService`, pode ser necessário configurar um banco de dados SQLite em memória.
- Garantir que os testes cubram cenários de sucesso e de falha.

---

## Comentários
- `(YYYY-MM-DD por @Jules): Tarefa criada como parte do novo plano de implementação do sistema de filas.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
