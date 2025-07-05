# ADR-012: Padrões para Casos de Uso e Serviços de Aplicação

**Status:** Proposto (Considerado Aprovado Conforme Instrução)

**Contexto:**
Casos de Uso e Serviços de Aplicação formam a camada de lógica de aplicação (`core/application/`), orquestrando interações com o domínio e a infraestrutura. É essencial padronizar sua estrutura, DTOs de entrada/saída, tratamento de erros e interações para garantir consistência, testabilidade e clareza. Esta ADR consolida e expande as observações da análise de código (e.g., `CreateAgentUseCase`, `GenericAgentExecutor`, `ChatService`).

**Decisão:**

Serão adotados os seguintes padrões para Casos de Uso e Serviços de Aplicação:

**1. Interface `IUseCase`:**
    *   **Padrão:** Todos os Casos de Uso devem implementar a interface genérica `IUseCase<TInput, TOutputPort>` (de `core/application/common/ports/use-case.interface.ts`).
        ```typescript
        // export interface IUseCase<TInput, TOutputPort> {
        //   execute(input: TInput): Promise<TOutputPort>;
        // }
        ```
    *   Onde `TInput` é o DTO de entrada e `TOutputPort` é o DTO de saída padronizado (`IUseCaseResponse`).
    *   **Justificativa:** Garante uma assinatura uniforme para todos os casos de uso, facilitando a composição e o uso polimórfico se necessário.

**2. DTOs (Data Transfer Objects) de Entrada e Saída:**
    *   **Definição:** DTOs são objetos simples usados para transportar dados entre camadas, especialmente para entrada e saída de Casos de Uso.
    *   **Validação de Entrada com Zod:**
        *   Cada Caso de Uso DEVE definir um esquema Zod para seu DTO de entrada.
        *   A primeira ação no método `execute()` DEVE ser a validação do DTO de entrada usando este esquema (e.g., `NomeDoEsquema.parse(input)` ou `safeParse` se um tratamento de erro mais granular for preferido antes de retornar `IUseCaseResponse`).
        *   Falhas na validação do Zod devem resultar no retorno de um `errorUseCaseResponse` (ver item 3).
    *   **Localização do Esquema:** Esquemas Zod para DTOs de Casos de Uso devem ser co-locados com o arquivo do Caso de Uso em um arquivo `*.schema.ts` (e.g., `create-agent.use-case.ts` e `create-agent.schema.ts`).
    *   **Nomeação de DTOs/Schemas:** `[NomeDoCasoDeUso]Input`, `[NomeDoCasoDeUso]Output`, `[NomeDoCasoDeUso]InputSchema`.
    *   **Justificativa:** Garante a integridade dos dados na entrada dos Casos de Uso. Zod fornece validação robusta e inferência de tipos. Co-localização melhora a organização.

**3. Resposta Padronizada para Casos de Uso (`IUseCaseResponse`):**
    *   **Padrão:** Todos os Casos de Uso DEVEM retornar `Promise<IUseCaseResponse<TOutputData, TErrorDetails>>` (de `shared/application/use-case-response.dto.ts`).
    *   Isto está alinhado com **ADR-008: Padrão de Tratamento de Erros e Resposta para Casos de Uso**, que deve ser consultado e seguido.
    *   Utilizar `successUseCaseResponse(data)` e `errorUseCaseResponse(errorData)` para construir a resposta.
    *   **Justificativa:** Contrato de saída uniforme, facilitando o tratamento de sucesso e falha pelos chamadores (e.g., handlers IPC, outros serviços).

**4. Design de Serviços de Aplicação:**
    *   **Propósito:** Serviços de Aplicação são usados para:
        *   Orquestrar lógica de negócios que envolve múltiplas entidades de domínio ou múltiplos Casos de Uso.
        *   Lidar com tarefas específicas da aplicação que não se encaixam em um único Caso de Uso CRUD-like (e.g., `GenericAgentExecutor`, `AgentInteractionService`, `ChatService`).
        *   Encapsular interações complexas com portas da camada de aplicação (e.g., adaptação de dados para um `ILLMAdapter`).
    *   **Injeção de Dependência:** Devem ser `@injectable()` e receber suas dependências (repositórios, outros serviços, adaptadores) via construtor.
    *   **Métodos:** Devem ter métodos públicos bem definidos que representam suas capacidades.
    *   **Retorno de Métodos Públicos:** Se um método de serviço representa uma operação completa que pode ser invocada de fora da camada de aplicação (e.g., por um handler IPC), ele DEVE idealmente seguir o mesmo padrão `IUseCaseResponse` para consistência. Para métodos puramente internos ou auxiliares, podem retornar tipos mais específicos ou `void`.
    *   **Exemplo:** `GenericAgentExecutor.process()` retorna `AgentExecutorResult`, que é conceitualmente similar a `IUseCaseResponse`. `ChatService.handleSendMessageStream()` retorna `IUseCaseResponse`.
    *   **Justificativa:** Permite a criação de componentes reutilizáveis para lógica de aplicação complexa, mantendo o SRP e a testabilidade.

**5. Gerenciamento de Estado em Operações Complexas (e.g., `ExecutionState`):**
    *   **Padrão:** Para operações de longa duração ou multi-etapas que requerem o rastreamento de um estado complexo e volátil (e.g., a execução de um agente pelo `GenericAgentExecutor` e seus sub-serviços), um objeto de estado dedicado (e.g., `ExecutionState`) pode ser usado.
    *   Este objeto de estado é tipicamente instanciado pelo orquestrador principal (e.g., `GenericAgentExecutor`) e passado como parâmetro para os sub-serviços envolvidos na operação.
    *   Os sub-serviços podem ler e *modificar* este objeto de estado compartilhado.
    *   **Escopo:** Este padrão de estado compartilhado e mutável deve ser limitado ao contexto de uma única operação orquestrada e não deve vazar para fora do serviço orquestrador principal como um DTO de resposta.
    *   **Justificativa:** Permite que múltiplos serviços colaborem em uma tarefa complexa, compartilhando informações de progresso, resultados intermediários e flags de controle (como `criticalErrorEncounteredThisTurn`) de forma eficiente sem prop drilling excessivo de múltiplos parâmetros.
    *   **Documentação:** A estrutura e as regras de modificação de tal objeto de estado devem ser claramente documentadas internamente para os serviços envolvidos.

**6. Interação com Entidades de Domínio (Durante Processamento Ativo):**
    *   **Contexto:** Serviços de aplicação (e.g., `AgentInteractionService`, `WorkerService` instrumentando o `JobEntity`) podem precisar atualizar informações em uma entidade que está sendo ativamente processada (e.g., adicionar logs, atualizar histórico, mudar status).
    *   **Padrão:**
        *   Se a **ADR-010 (Entity/VO Standards)** definir Entidades como estritamente imutáveis (métodos sempre retornam nova instância), então os serviços devem obter a nova instância e passá-la adiante ou atualizar sua referência.
        *   Se a ADR-010 permitir mutação interna controlada para certos aspectos (e.g., coleções internas como logs em `JobEntity`), os serviços podem chamar esses métodos mutadores diretamente na instância da entidade que estão processando. Esta abordagem parece ser a utilizada por `JobEntity.addLog()` e `JobEntity.updateProgress()` quando chamados pelo `WorkerService` (após instrumentação) ou `GenericAgentExecutor`.
        *   **Decisão (Alinhar com ADR-010):** A prática de `UserEntity` (retornar sempre nova instância) é a mais robusta. Para `JobEntity` e seu processamento, se a mutação interna for mantida para logs/progresso/histórico durante uma execução ativa, isso deve ser uma exceção documentada e justificada pela complexidade/performance da passagem de estado do Job. O estado final do Job (`status`, `returnValue`, `failedReason`) ainda deve seguir o padrão de transição de estado que resulta na persistência final (provavelmente via `jobRepository.update` com a instância final do job).
    *   **Justificativa:** Define como a camada de aplicação interage com o estado das entidades durante operações de longa duração, equilibrando imutabilidade e a necessidade de registrar progresso ou dados voláteis.

**7. Tratamento de Erros em Casos de Uso e Serviços:**
    *   **Padrão:**
        *   Devem capturar exceções específicas do domínio (e.g., `EntityError`, `ValueError` lançadas por entidades ou VOs) ou da camada de infraestrutura (e.g., `InfrastructureError` de um repositório, `LLMError` de um adaptador).
        *   Devem mapear essas exceções para o formato de erro do `IUseCaseResponse` (conforme ADR-008), incluindo um `code` apropriado se aplicável, e a mensagem de erro.
        *   Não devem vazar exceções de baixo nível para o chamador.
    *   **Justificativa:** Consistência no tratamento de erros e desacoplamento do chamador em relação aos detalhes internos de falha.

**8. Idempotência:**
    *   **Padrão:** Casos de Uso e Serviços que realizam operações de escrita ou que têm efeitos colaterais devem ser projetados para serem idempotentes sempre que possível e relevante.
    *   **Estratégias:** Podem incluir checagem de estado prévio, uso de tokens de idempotência, ou designar as operações de domínio/repositório subjacentes para serem idempotentes.
    *   **Justificativa:** Aumenta a robustez contra reintentativas de rede ou falhas parciais.

**9. Gerenciamento de Transações:**
    *   **Padrão:** Se um Caso de Uso ou Serviço de Aplicação orquestrar múltiplas operações de escrita em repositórios que precisam ser atômicas (todas bem-sucedidas ou todas falham), a responsabilidade por iniciar, cometer ou reverter a transação de banco de dados recai sobre este Caso de Uso/Serviço.
    *   A forma exata (e.g., injetar um `UnitOfWork` ou um `TransactionManager`, ou métodos `beginTransaction/commit/rollback` no próprio repositório) será detalhada na **ADR-XXX-PersistencePatternsWithDrizzle.md**.
    *   **Justificativa:** Garante a consistência dos dados quando múltiplas etapas de persistência estão envolvidas em uma única operação de negócios.

**Consequências:**
*   Casos de Uso e Serviços de Aplicação terão uma estrutura e comportamento mais padronizados.
*   Interação com o domínio e a infraestrutura será mais clara e consistente.
*   Melhor testabilidade e manutenibilidade da lógica de aplicação.
*   Clareza sobre como o estado é gerenciado em operações complexas.

---
**Notas de Implementação para LLMs:**
*   Ao criar um novo Caso de Uso:
    *   Implemente `IUseCase<Input, IUseCaseResponse<Output>>`.
    *   Crie `*.schema.ts` para DTOs de entrada/saída com Zod. Valide a entrada primeiro.
    *   Use `successUseCaseResponse` e `errorUseCaseResponse`.
    *   Injete dependências (repositórios, serviços) pelo construtor.
*   Ao criar um Serviço de Aplicação:
    *   Defina claramente sua responsabilidade.
    *   Use DI para dependências.
    *   Se expuser métodos que são pontos de entrada para funcionalidades, considere retornar `IUseCaseResponse`.
    *   Para operações complexas usando estado compartilhado (como `ExecutionState`), entenda seu ciclo de vida e quais partes podem ser modificadas.
