# Tarefa: QSYS-4.2 - Testes Unitários e de Integração para Fase 4

**ID da Tarefa:** `QSYS-4.2`
**Título Breve:** Testes Unitários e de Integração para `QueueSchedulerService`
**Descrição Completa:**
Escrever testes unitários e de integração abrangentes para o `QueueSchedulerService`, cobrindo todas as suas responsabilidades (promoção de jobs atrasados, tratamento de jobs parados, gerenciamento de jobs repetíveis, e verificação de dependências).

---

**Status:** `Pendente`
**Dependências (IDs):** `QSYS-4.1`
**Complexidade (1-5):** `3`
**Prioridade (P0-P4):** `P1`
**Responsável:** `Jules`
**Branch Git Proposta:** `test/qsys-4.2-phase4-tests`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Testes unitários para `QueueSchedulerService`:
    - Mockar `IJobRepository` e `JobEventEmitter`.
    - Testar cada lógica separadamente:
        - `promoteDelayedJobs()`: Verificar se os jobs corretos são selecionados e atualizados para `PENDING`.
        - `handleStalledJobs()`: Verificar se jobs parados são corretamente movidos para `FAILED` ou `PENDING` (retry).
        - `manageRepeatableJobs()`: Verificar se novas instâncias de jobs são criadas conforme as programações.
        - `checkJobDependencies()`: Verificar se jobs `WAITING_CHILDREN` são promovidos quando suas dependências são concluídas.
    - Testar a emissão correta de eventos.
    - Testar o ciclo de vida do serviço (`start()`, `stop()`, loop de polling com mocks de tempo).
- Testes de integração para `QueueSchedulerService`:
    - Utilizar uma instância real (ou em memória) do `DrizzleJobRepository` e `InMemoryJobEventEmitter`.
    - Criar cenários de teste no banco de dados com jobs em diferentes estados (atrasados, parados, repetíveis, com dependências).
    - Executar o `QueueSchedulerService` e verificar se o estado do banco de dados é atualizado corretamente e se os eventos esperados são emitidos.
    - Testar a robustez do scheduler em caso de erros durante suas operações.
- Alta cobertura de código para os componentes da Fase 4.

---

## Notas/Decisões de Design
- Utilizar Vitest.
- Mocking de tempo (`vi.useFakeTimers()`) será essencial para testar a lógica de polling e as funcionalidades baseadas em tempo do scheduler.
- Os testes de integração são particularmente importantes para validar as interações complexas do scheduler com o estado do banco de dados.

---

## Comentários
- `(YYYY-MM-DD por @Jules): Tarefa criada como parte do novo plano de implementação do sistema de filas.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
