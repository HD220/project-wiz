# Tarefa: QSYS-1.5 - Testes Unitários para Fase 1

**ID da Tarefa:** `QSYS-1.5`
**Título Breve:** Testes Unitários para Fase 1 (Job Entity, VOs, DrizzleJobRepository)
**Descrição Completa:**
Escrever testes unitários para os componentes desenvolvidos na Fase 1 da implementação do sistema de filas: a entidade `Job` (incluindo seus métodos de transição de estado e lógica de VOs), os Value Objects associados, e a implementação `DrizzleJobRepository` (com Drizzle client mockado).

---

**Status:** `Pendente`
**Dependências (IDs):** `QSYS-1.1, QSYS-1.2, QSYS-1.3`
**Complexidade (1-5):** `3`
**Prioridade (P0-P4):** `P1`
**Responsável:** `Jules`
**Branch Git Proposta:** `test/qsys-1.5-phase1-unit-tests`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Testes unitários abrangentes para a entidade `Job`:
    - Criação com diferentes opções.
    - Transições de estado válidas e inválidas.
    - Lógica de `updateProgress()`, `log()`.
    - Lógica de `canRetry()`, `prepareForNextAttempt()`, `finalizeExecution()`.
- Testes unitários para Value Objects críticos (ex: `JobStatus`, `RetryPolicy`, `JobOptionsVO` se criado).
    - Validação de construtores.
    - Métodos de comparação e lógica interna.
- Testes unitários para `DrizzleJobRepository`:
    - Mockar a instância do cliente Drizzle.
    - Verificar se os métodos do repositório chamam as funções Drizzle corretas com os parâmetros esperados.
    - Testar a lógica de mapeamento entre entidade de domínio e schema Drizzle.
    - Testar o tratamento de `Result` (sucesso e erro).
- Alta cobertura de código para os componentes da Fase 1.

---

## Notas/Decisões de Design
- Utilizar Vitest como framework de teste.
- Focar em isolar unidades; mocks são essenciais para o repositório.
- Os testes devem garantir que a lógica do domínio do Job e a interação do repositório com o ORM (mockado) estejam corretas.

---

## Comentários
- `(YYYY-MM-DD por @Jules): Tarefa criada como parte do novo plano de implementação do sistema de filas.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
