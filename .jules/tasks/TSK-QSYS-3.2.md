# Tarefa: QSYS-3.2 - Refinar Job Entity/Interface para contexto do Worker

**ID da Tarefa:** `QSYS-3.2`
**Título Breve:** Refinar `Job` Entity/Interface para contexto do Worker
**Descrição Completa:**
Refinar a entidade/interface `Job` (de `QSYS-1.1`) para garantir que ela possa ser usada efetivamente dentro da `processorFunction` de um `JobWorkerService`. Especificamente, implementar a lógica por trás dos métodos `job.updateProgress()` e `job.log()` para que persistam as alterações e emitam os eventos correspondentes.

---

**Status:** `Pendente`
**Dependências (IDs):** `QSYS-1.1, QSYS-1.3, QSYS-2.1`
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P1`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/qsys-3.2-job-worker-context`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- O objeto `Job` passado para a `processorFunction` do `JobWorkerService` possui os métodos:
    - `updateProgress(value: number | object): Promise<void>`:
        - Atualiza o campo `progress` do job no banco de dados (via `IJobRepository`).
        - Emite o evento `job.progress` através do `JobEventEmitter`.
    - `log(message: string, level?: string): Promise<void>`:
        - Adiciona uma entrada de log ao campo `executionLogs` do job no banco de dados (via `IJobRepository`).
        - Emite o evento `job.log_added` através do `JobEventEmitter`.
- A entidade `Job` (ou uma classe `JobContext` que a envolve) precisa ter acesso (ou ser injetada com) `IJobRepository` e `JobEventEmitter` para executar essas ações.
- Os métodos `moveToCompleted` e `moveToFailed` na entidade `Job` (ou `JobContext`) são revisados para garantir que interajam corretamente com o repositório e emitam os eventos apropriados.

---

## Notas/Decisões de Design
- **Opção 1: Job Rico (Rich Domain Object):** A instância de `Job` em si contém referências (injetadas) ao `IJobRepository` e `JobEventEmitter`. Seus métodos (`updateProgress`, `log`, `moveToCompleted`, `moveToFailed`) realizam as operações diretamente.
    - *Pró:* Encapsulamento forte da lógica do job.
    - *Contra:* Entidade de domínio se torna dependente de serviços de infraestrutura/aplicação, o que pode violar um purismo da Clean Architecture (domínio não deve conhecer camadas externas).
- **Opção 2: Job como Data + JobService/Context:** O `Job` é primariamente um objeto de dados. O `JobWorkerService` passa para o `processorFunction` uma instância de `Job` junto com um `JobContextService` (ou o próprio `JobWorkerService` atua como este contexto) que possui métodos como `updateJobProgress(jobId, value)`, `addJobLog(jobId, message)`.
    - *Pró:* Mantém a entidade `Job` mais pura.
    - *Contra:* A API para o usuário dentro do processador se torna `context.updateProgress(job.id, ...)` em vez de `job.updateProgress(...)`.
- **Opção 3 (Híbrida):** O objeto `Job` recebido pelo processador é uma classe wrapper (um `ActiveJobContext`) que contém o `Job` (data) e referências ao repositório/emitter, expondo os métodos `updateProgress`, `log` etc.
- A decisão sobre qual abordagem tomar deve ser feita aqui, visando a melhor Developer Experience (DX) para o usuário que escreve a `processorFunction` e a manutenibilidade. O design atual da API (Seção 4.1 do doc de design) sugere métodos no próprio objeto `Job`. Isso implica a Opção 1 ou 3. A Opção 3 é um bom compromisso.

---

## Comentários
- `(YYYY-MM-DD por @Jules): Tarefa criada como parte do novo plano de implementação do sistema de filas.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
