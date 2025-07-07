# ADR-021: Design para Funções Processadoras de Job (Job Processor Function)

**Status:** Proposto (Considerado Aprovado Conforme Instrução)

**Contexto:**
Jobs enfileirados pelo sistema de filas (ADR-020) necessitam de uma lógica de execução específica. Esta lógica é encapsulada em "Funções Processadoras de Job". O `WorkerService` (ADR-022) é responsável por invocar estas funções. É crucial padronizar a assinatura, responsabilidades e interações dessas funções. A análise do `queue-usage-example.final.ts` e do `WorkerService` informa esta decisão.

**Decisão:**

Serão adotados os seguintes padrões para o design de Funções Processadoras de Job:

**1. Definição e Propósito:**
    *   **Definição:** Uma Função Processadora de Job é uma função que contém a lógica de negócios específica para executar um tipo de job. Ela é o "coração" do trabalho que um job representa.
    *   **Propósito:** Executar a tarefa definida pelo job, utilizando o payload do job, e reportar o resultado ou falha.
    *   **Exemplo de Uso:** Para jobs que executam tarefas de agentes de IA, a função processadora seria tipicamente o método `process(job)` de um serviço como o `GenericAgentExecutor`.

**2. Assinatura Padrão (`ProcessorFunction<P, R>`):**
    *   **Padrão:** A assinatura de uma função processadora deve ser:
        ```typescript
        type ProcessorFunction<P, R> = (job: JobEntity<P, R>) => Promise<R>;
        ```
        Onde:
        *   `P`: Tipo do payload do job (e.g., `AgentExecutionPayload`).
        *   `R`: Tipo do valor de retorno esperado da execução bem-sucedida do job.
        *   `job: JobEntity<P, R>`: A instância completa da entidade do job é passada para a função.
    *   A função DEVE retornar uma `Promise<R>`.
    *   **Justificativa:** Assinatura clara, fortemente tipada e que suporta operações assíncronas.

**3. Interação com `JobEntity` Dentro da Função Processadora:**
    *   **Acesso ao Payload:** A função processadora acessa o payload do job através de `job.props.payload`.
    *   **Atualização de Progresso e Logs (Instrumentação pelo `WorkerService`):**
        *   Quando uma função processadora é invocada pelo `WorkerService`, os métodos `job.updateProgress()` e `job.addLog()` na instância `job` fornecida são *instrumentados* (sobrescritos temporariamente) pelo `WorkerService`.
        *   **Padrão:** A função processadora DEVE chamar `job.updateProgress(valor)` e `job.addLog(mensagem, nivel?)` diretamente na instância `job` recebida para registrar progresso e logs.
        *   O `WorkerService` garante que essas chamadas (além de atualizarem o estado em memória da entidade `job`) também resultem na persistência dessas atualizações no banco de dados através dos métodos correspondentes da `AbstractQueue` (e.g., `queue.updateJobProgress()`).
        *   A função processadora NÃO DEVE chamar diretamente `jobRepository.save()` ou métodos da fila para atualizar progresso/logs.
    *   **Outras Propriedades:** A função pode ler outras propriedades do job (e.g., `job.attemptsMade`, `job.name`, `job.id`) conforme necessário.
    *   **Justificativa:** Permite que a lógica do job reporte progresso e logs de forma simples, enquanto o `WorkerService` e a `AbstractQueue` lidam com a complexidade da persistência e da comunicação.

**4. Sinalização de Sucesso:**
    *   **Padrão:** Uma execução bem-sucedida é sinalizada pela `Promise` retornada pela função processadora resolvendo com o valor de resultado (do tipo `R`).
    *   O `WorkerService` então chamará `queue.markJobAsCompleted(job.id, workerId, result, job)` com este resultado.
    *   **Justificativa:** Padrão de Promise padrão para sucesso.

**5. Sinalização de Falha:**
    *   **Padrão:** Uma falha na execução é sinalizada pela função processadora lançando (`throw`) um `Error`.
    *   Idealmente, deve-se lançar uma instância de um erro customizado que herde de `CoreError` (conforme ADR-014), como `ApplicationError` ou um erro de negócio específico, if a falha for devido a uma regra de negócio ou condição de erro esperada dentro do processador.
    *   O `WorkerService` capturará esta exceção e chamará `queue.markJobAsFailed(job.id, workerId, error, job)`.
    *   **Justificativa:** Padrão de Promise padrão para falhas. Erros tipados ajudam no tratamento e diagnóstico.

**6. Idempotência:**
    *   **Consideração:** Para jobs que podem ser reintentados (devido a falhas transitórias ou configuração de `attempts`), a função processadora deve ser projetada para ser idempotente, se a natureza da tarefa permitir e exigir.
    *   **Idempotente:** Executar a função múltiplas vezes com o mesmo job (mesmo payload e estado inicial relevante) deve produzir o mesmo resultado final ou efeito colateral que uma única execução bem-sucedida.
    *   **Estratégias (se aplicável):** Verificar estado prévio, usar identificadores únicos para transações externas, etc.
    *   **Justificativa:** Garante que reintentativas não causem duplicação de dados ou efeitos colaterais indesejados.

**7. Tarefas de Longa Duração e Extensão de Lock:**
    *   **Padrão:** A função processadora NÃO é responsável por gerenciar a extensão do lock do job. O `WorkerService` (conforme ADR-022) lida automaticamente com a renovação periódica do lock enquanto a função processadora está em execução.
    *   A função processadora deve focar exclusivamente na execução da lógica de negócios do job.
    *   **Justificativa:** Separação de responsabilidades. A lógica de processamento não precisa se preocupar com a infraestrutura de locking da fila.

**8. Complexidade e Estrutura da Função Processadora:**
    *   **Função Simples:** Para jobs com lógica de processamento direta e poucas dependências, uma função anônima ou nomeada simples é suficiente.
        ```typescript
        // // Exemplo no setup do WorkerService:
        // const emailProcessor: ProcessorFunction<EmailPayload, EmailResult> = async (job) => {
        //   // ... lógica para enviar email usando job.props.payload ...
        //   job.addLog("Email enviado com sucesso.");
        //   return { status: "SENT" };
        // };
        // // new WorkerService(queue, emailProcessor, options);
        ```
    *   **Classe Processadora Dedicada (para lógica complexa):**
        *   **Padrão:** Se a lógica de processamento de um tipo de job for complexa, envolver múltiplas etapas, ou tiver suas próprias dependências que precisam ser injetadas (e.g., outros serviços de aplicação, mas geralmente NÃO repositórios diretamente), considere criar uma classe dedicada que implementa uma interface `IJobProcessor<P, R>`.
            ```typescript
            // interface IJobProcessor<P, R> {
            //   process(job: JobEntity<P, R>): Promise<R>;
            // }
            // @injectable()
            // class ComplexDataAnalysisProcessor implements IJobProcessor<AnalysisPayload, AnalysisResult> {
            //   constructor(@inject(ANALYSIS_HELPER_SERVICE) private helperService: IAnalysisHelper) {}
            //   async process(job: JobEntity<AnalysisPayload, AnalysisResult>): Promise<AnalysisResult> {
            //     // ... lógica complexa usando this.helperService ...
            //     job.updateProgress(50);
            //     // ...
            //     return { reportUrl: "..." };
            //   }
            // }
            ```
        *   A instância desta classe processadora (resolvida via DI) teria seu método `process` adaptado para a assinatura `ProcessorFunction` ao configurar o `WorkerService`.
            ```typescript
            // // No setup do WorkerService, após resolver complexProcessor via DI:
            // // const boundProcessor = complexProcessor.process.bind(complexProcessor);
            // // new WorkerService(queue, boundProcessor, options);
            ```
        *   **Justificativa:** Melhora a organização, testabilidade e gerenciamento de dependências para lógica de job complexa, aderindo ao SRP e permitindo que a lógica do processador seja reutilizável ou configurável.

**9. Relação com `GenericAgentExecutor`:**
    *   **Padrão:** Para jobs que representam tarefas a serem executadas por um agente de IA, a `ProcessorFunction` configurada no `WorkerService` será tipicamente o método `process(job)` de uma instância do `GenericAgentExecutor` (ou um serviço similar que implemente `IAgentExecutor`).
    *   O `GenericAgentExecutor` então orquestra a interação com LLMs, ferramentas, etc., conforme sua própria lógica e sub-serviços.
    *   **Justificativa:** O `WorkerService` é agnóstico ao tipo de trabalho, ele apenas invoca a função processadora. O `GenericAgentExecutor` encapsula a complexidade da execução de agentes.

**Consequências:**
*   Interface clara e padronizada para toda a lógica de execução de jobs.
*   Integração suave com o `WorkerService` e o sistema de filas.
*   Facilidade para testar a lógica de processamento de jobs isoladamente (mockando a `JobEntity`).
*   Flexibilidade para implementar processadores simples como funções ou mais complexos como classes.

---
**Notas de Implementação para LLMs:**
*   Ao definir a lógica para um novo tipo de job:
    *   Crie uma função (ou classe processadora) que corresponda à assinatura `ProcessorFunction<PayloadType, ResultType>`.
    *   Receba a `JobEntity` como parâmetro.
    *   Use `job.props.payload` para acessar os dados específicos do job.
    *   Chame `job.updateProgress()` e `job.addLog()` para reportar o andamento.
    *   Retorne o resultado em caso de sucesso, ou lance um `Error` (preferencialmente um `CoreError` customizado) em caso de falha.
    *   Lembre-se que `job.updateProgress()` e `job.addLog()` dentro do processador são instrumentados pelo `WorkerService` para persistir as mudanças.
