# ADR-012: Padrões para Casos de Uso e Serviços de Aplicação

**Status:** Proposto (Considerado Aprovado Conforme Instrução - Revisado para alinhamento com UseCaseWrapper)

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
    *   Onde `TInput` é o DTO de entrada e `TOutputPort` define o contrato de saída do Caso de Uso. Conforme **ADR-008**, `TOutputPort` será tipicamente `IUseCaseResponse<TSuccessData, TErrorDetails>`.
    *   **Clarificação Importante sobre Implementação Concreta:**
        *   A interface `IUseCase` define o contrato externo. No entanto, a implementação concreta do método `execute(input: TInput)` em uma classe de Caso de Uso DEVE:
            *   Em caso de sucesso, retornar diretamente o dado de sucesso (e.g., `Promise<TSuccessData>`).
            *   Em caso de falha, lançar (`throw`) uma instância de `CoreError` (ou suas subclasses como `ApplicationError`, `EntityError`, `InfrastructureError`) diretamente.
            *   A transformação para `Promise<IUseCaseResponse<TSuccessData, TErrorDetails>>` é responsabilidade de um `UseCaseWrapper` (conforme ADR-008 e item 3 desta ADR), que envolve a execução do caso de uso concreto.
    *   **Justificativa:** Garante uma assinatura externa uniforme para todos os casos de uso. A separação entre o retorno direto/throw da implementação concreta e a padronização da resposta pelo `UseCaseWrapper` simplifica a escrita dos Casos de Uso, tornando-os focados puramente na lógica de negócios e no lançamento de erros, enquanto o Wrapper lida com a padronização da resposta final.

**2. DTOs (Data Transfer Objects) de Entrada e Saída:**
    *   **Definição:** DTOs são objetos simples usados para transportar dados entre camadas, especialmente para entrada e saída de Casos de Uso.
    *   **Validação de Entrada com Zod:**
        *   Cada Caso de Uso DEVE definir um esquema Zod para seu DTO de entrada.
        *   A primeira ação no método `execute()` DEVE ser a validação do DTO de entrada usando este esquema (e.g., `NomeDoEsquema.parse(input)` ou `safeParse` se um tratamento de erro mais granular for preferido antes de retornar `IUseCaseResponse`).
        *   Falhas na validação do Zod (e.g., usando `NomeDoEsquema.parse(input)` que lança exceção, ou verificando `safeParse(input).success === false`) DEVEM resultar no lançamento de um `ApplicationError` (ou um `ValidationError` customizado, subclasse de `CoreError`) contendo os detalhes do erro Zod. Este erro será então capturado e tratado pelo `UseCaseWrapper`.
    *   **Localização do Esquema:** Esquemas Zod para DTOs de Casos de Uso devem ser co-locados com o arquivo do Caso de Uso em um arquivo `*.schema.ts` (e.g., `create-agent.use-case.ts` e `create-agent.schema.ts`). Os nomes dos arquivos devem seguir `kebab-case`.
    *   **Nomeação de DTOs/Schemas:** `[NomeDoCasoDeUso]Input`, `[NomeDoCasoDeUso]Output`, `[NomeDoCasoDeUso]InputSchema`.
    *   **Justificativa:** Garante a integridade dos dados na entrada dos Casos de Uso. Zod fornece validação robusta e inferência de tipos. Co-localização melhora a organização.

**3. Resposta Padronizada para Casos de Uso (`IUseCaseResponse`):**
    *   **Padrão:** `IUseCaseResponse<TOutputData, TErrorDetails>` (de `shared/application/use-case-response.types.ts`) é o contrato de resposta *externo* e padronizado para qualquer Caso de Uso, conforme definido na **ADR-008**.
    *   Esta resposta é tipicamente construída por um `UseCaseWrapper` (ver ADR-008) que executa o método `execute` do Caso de Uso concreto.
    *   Implementações concretas de Casos de Uso NÃO DEVEM construir `IUseCaseResponse` diretamente. Elas retornam os dados de sucesso diretamente (e.g., `Promise<TSuccessData>`) ou lançam uma instância de `CoreError` (ou suas subclasses) em caso de falha.
    *   **Justificativa:** Contrato de saída uniforme, facilitando o tratamento de sucesso e falha pelos chamadores (e.g., handlers IPC, outros serviços) através do `UseCaseWrapper`.

**4. Design de Serviços de Aplicação:**
    *   **Propósito:** Serviços de Aplicação são usados para:
        *   Orquestrar lógica de negócios que envolve múltiplas entidades de domínio ou múltiplos Casos de Uso.
        *   Lidar com tarefas específicas da aplicação que não se encaixam em um único Caso de Uso CRUD-like (e.g., `GenericAgentExecutor`, `AgentInteractionService`, `ChatService`).
        *   Encapsular interações complexas com portas da camada de aplicação (e.g., adaptação de dados para um `ILLMAdapter`).
    *   **Injeção de Dependência:** Devem ser `@injectable()` e receber suas dependências (repositórios, outros serviços, adaptadores) via construtor.
    *   **Métodos:** Devem ter métodos públicos bem definidos que representam suas capacidades.
    *   **Retorno de Métodos Públicos:** Métodos de Serviços de Aplicação que são pontos de entrada (análogos a um Caso de Uso e potencialmente invocados por handlers IPC ou outros serviços de alto nível) DEVEM também seguir o padrão de retornar dados de sucesso diretamente ou lançar `CoreError` (ou suas subclasses). Eles também podem ser envolvidos por um `UseCaseWrapper` ou lógica similar no handler IPC para padronizar a resposta como `IUseCaseResponse`. Métodos puramente internos ou auxiliares de um serviço devem retornar tipos específicos ou `void` e lançar erros em caso de falha, que serão tratados pelo método público chamador.
    *   **Exemplo:** `GenericAgentExecutor.process()` retorna `Promise<AgentExecutorResultData>` (onde `AgentExecutorResultData` são os dados de sucesso) ou lança um `CoreError`. Se chamado por um handler, este o envolveria para produzir `IUseCaseResponse`. Similarmente, `ChatService.handleSendMessageStream()` (se atuando como ponto de entrada) lançaria um erro em caso de falha ou retornaria dados de sucesso (e.g., `Promise<StreamData>`), e o chamador (e.g., handler IPC) o envolveria para gerar a `IUseCaseResponse` final, possivelmente com a ajuda de um `UseCaseWrapper`.
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
        *   Casos de Uso e Serviços de Aplicação DEVEM capturar exceções específicas de camadas inferiores (e.g., `EntityError`, `ValueError` do domínio; `InfrastructureError` da infraestrutura) somente se precisarem adicionar contexto específico da aplicação ao erro.
        *   Se o erro capturado já for uma instância de `CoreError` (ou suas subclasses como `EntityError`, `ApplicationError`, `InfrastructureError`) e contiver informação suficiente, ele pode ser simplesmente relançado (`throw error;`).
        *   Se um novo contexto de aplicação for necessário, ou se um erro não-CoreError for capturado, ele DEVE ser encapsulado em uma instância apropriada de `ApplicationError` (ou outra subclasse de `CoreError`) antes de ser lançado.
        *   O objetivo é que o `UseCaseWrapper` (ou o handler IPC) sempre receba um `CoreError` (ou sua subclasse) que ele possa então usar para construir a parte `error` da `IUseCaseResponse` (conforme ADR-008).
        *   Casos de Uso e Serviços de Aplicação NÃO DEVEM construir o objeto `IUseCaseResponse.error` diretamente.
    *   **Justificativa:** Consistência no tratamento de erros e desacoplamento do chamador em relação aos detalhes internos de falha. Permite que o `UseCaseWrapper` lide de forma centralizada com a tradução de `CoreError` para a estrutura `IUseCaseResponse.error`.

**8. Idempotência:**
    *   **Padrão:** Casos de Uso e Serviços que realizam operações de escrita ou que têm efeitos colaterais devem ser projetados para serem idempotentes sempre que possível e relevante.
    *   **Estratégias:** Podem incluir checagem de estado prévio, uso de tokens de idempotência, ou designar as operações de domínio/repositório subjacentes para serem idempotentes.
    *   **Justificativa:** Aumenta a robustez contra reintentativas de rede ou falhas parciais.

**9. Gerenciamento de Transações:**
    *   **Padrão:** Se um Caso de Uso ou Serviço de Aplicação orquestrar múltiplas operações de escrita em repositórios que precisam ser atômicas (todas bem-sucedidas ou todas falham), a responsabilidade por iniciar, cometer ou reverter a transação de banco de dados recai sobre este Caso de Uso/Serviço.
    *   A forma exata será detalhada na **ADR-017: Padrões de Persistência com Drizzle ORM**.
    *   **Justificativa:** Garante a consistência dos dados quando múltiplas etapas de persistência estão envolvidas em uma única operação de negócios.

**Consequências:**
*   Casos de Uso e Serviços de Aplicação terão uma estrutura e comportamento mais padronizados e simplificados.
*   Interação com o domínio e a infraestrutura será mais clara e consistente.
*   Melhor testabilidade e manutenibilidade da lógica de aplicação.
*   Clareza sobre como o estado é gerenciado em operações complexas e como as respostas são padronizadas externamente.

---
**Notas de Implementação para LLMs:**
*   Ao criar um novo Caso de Uso:
    *   A assinatura do método `execute` deve ser `async execute(input: TInput): Promise<TSuccessData>`, onde `TSuccessData` é o tipo dos dados retornados em caso de sucesso (NÃO `IUseCaseResponse`).
    *   Crie um arquivo `kebab-case-nome.schema.ts` para o DTO de entrada (`[NomeCasoDeUso]Input`) e valide a entrada no início do método `execute` usando `NomeSchema.parse(input)`. Em caso de falha na validação Zod, lance um `ApplicationError` com os detalhes.
    *   Em caso de sucesso da lógica de negócios, retorne os dados de sucesso diretamente (e.g., `return projectDto;`).
    *   Em caso de falha (erros de domínio, erros de infraestrutura capturados e mapeados, ou erros de lógica de aplicação), lance uma instância de `CoreError` ou suas subclasses (e.g., `throw new ApplicationError("Operação falhou devido a X");`).
    *   O `UseCaseWrapper` (conforme ADR-008) se encarregará de capturar o retorno de sucesso ou o erro lançado e converter para a estrutura `IUseCaseResponse` final.
    *   Injete dependências (repositórios, outros serviços, adaptadores) pelo construtor usando InversifyJS.
*   Ao criar um Serviço de Aplicação:
    *   Defina claramente sua responsabilidade.
    *   Use DI para dependências.
    *   Se um método público for um ponto de entrada principal (similar a um caso de uso):
        *   Ele deve retornar dados de sucesso diretamente (e.g., `Promise<ServiceOutputData>`) ou lançar uma instância de `CoreError` em caso de falha.
        *   O chamador de alto nível (e.g., handler IPC, outro Caso de Uso) que utiliza este serviço, possivelmente com um `UseCaseWrapper`, será responsável por transformar este resultado/erro em uma `IUseCaseResponse` se necessário.
    *   Para operações complexas usando estado compartilhado (como `ExecutionState`), entenda seu ciclo de vida e quais partes podem ser modificadas, limitando o escopo desse estado.
