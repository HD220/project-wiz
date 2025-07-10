# ADR-013: Estratégia de Logging Principal da Aplicação

**Status:** Proposto (Considerado Aprovado Conforme Instrução)

**Contexto:**
Um sistema de logging consistente e eficaz é crucial para depuração, monitoramento, auditoria e compreensão do comportamento da aplicação em desenvolvimento e produção. A análise atual revelou o uso de uma interface `ILogger` injetável, chamadas diretas a `console.*` em alguns locais, e um mecanismo de logging específico para `JobEntity`. Esta ADR visa padronizar a estratégia de logging.

**Decisão:**

Serão adotados os seguintes padrões para logging na aplicação:

**1. Interface Padrão `ILogger`:**
_ **Padrão:** A interface `ILogger` (de `core/common/services/i-logger.service.ts`) é o contrato padrão para todas as necessidades de logging da aplicação. Todas as partes do sistema que necessitam de logging devem receber uma instância de `ILogger` via injeção de dependência.
_ **Métodos Padrão:** A interface `ILogger` deve prover no mínimo os seguintes métodos, representando níveis de severidade:
_ `error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void;`
_ `warn(message: string, context?: Record<string, unknown>): void;`
_ `info(message: string, context?: Record<string, unknown>): void;`
_ `debug(message: string, context?: Record<string, unknown>): void;` // Para logs detalhados de desenvolvimento
_ `verbose?(message: string, context?: Record<string, unknown>): void;` // Opcional, para logs ainda mais detalhados que debug
_ O parâmetro `context` é um objeto para fornecer dados estruturados adicionais. O parâmetro `error` no método `error` é para passar o objeto de erro original. \* **Justificativa:** Abstrai a implementação de logging, permitindo diferentes implementações (e.g., console para dev, serviço de logging para prod) sem alterar o código da aplicação. Padroniza os métodos de logging.

**2. Uso de `console.*`:**
_ **Padrão:** O uso direto de `console.log()`, `console.warn()`, `console.error()`, etc., é FORTEMENTE DESENCORAJADO e deve ser evitado no código das camadas `core/` e `infrastructure/`, e na maior parte da camada `presentation/`.
_ **Exceções Permitidas:**
_ Scripts de exemplo (`src/examples/`).
_ Mensagens de status muito iniciais no `main.ts` do Electron, antes que a instância `ILogger` esteja configurada e disponível.
_ No script `preload.ts` do Electron para logs simples de status de exposição da API (e.g., `console.log("[Preload] electronIPC exposed.")`).
_ Durante depuração interativa temporária (deve ser removido antes do commit).
_ **Justificativa:** `ILogger` permite controle centralizado sobre o formato, destino e níveis de log, o que é perdido com `console._` direto.

**3. Níveis de Log:**
_ **Padrão:** Serão utilizados os seguintes níveis de log, em ordem de severidade decrescente:
_ **ERROR:** Erros críticos de execução, falhas que impedem o funcionamento normal de uma funcionalidade, exceções não tratadas. Requerem atenção imediata.
_ **WARN:** Condições inesperadas ou problemas potenciais que não impedem o funcionamento atual, mas podem indicar problemas futuros ou degradar a performance/qualidade.
_ **INFO:** Mensagens informativas sobre o progresso normal da aplicação, eventos importantes do ciclo de vida de componentes ou operações significativas (e.g., "Serviço X iniciado", "Job Y processado com sucesso").
_ **DEBUG:** Informações detalhadas úteis para depuração durante o desenvolvimento. Não devem estar habilitados por padrão em produção, a menos que para diagnóstico específico.
_ **VERBOSE/TRACE (Opcional):** Logs ainda mais granulares que `DEBUG`, para rastreamento fino de execução. Raramente habilitados em produção.
_ **Implementação:** Recomenda-se usar um enum ou um tipo de união literal para representar os níveis de log internamente na implementação do `ILogger` para consistência.
_ **Justificativa:** Permite filtrar logs por severidade, facilitando a análise em diferentes ambientes e contextos (e.g., apenas ERRO e WARN em produção, INFO e DEBUG em desenvolvimento).

**4. Logging Estruturado e Contextual:**
_ **Padrão:** A implementação padrão do `ILogger` (especialmente para ambientes de produção ou ao logar para arquivos/serviços) DEVE suportar logging estruturado, preferencialmente em formato JSON.
_ **Contexto Padrão:** Cada entrada de log deve incluir automaticamente (se possível pela implementação do logger):
_ `timestamp` (ISO 8601)
_ `level` (string do nível: "ERROR", "INFO", etc.)
_ `message` (a mensagem de log principal)
_ **Contexto Adicional (`context` object):** O parâmetro `context` nos métodos do `ILogger` deve ser usado para fornecer dados estruturados relevantes para a entrada de log.
_ Exemplos: `jobId`, `userId`, `entityId`, `serviceName`, `methodName`, `inputParams`, `durationMs`.
_ **Exemplo de Uso:**
`typescript
            // this.logger.info("Job processed successfully", {
            //   jobId: job.id.value,
            //   workerId: this.workerId,
            //   processingTimeMs: 1230
            // });
            // this.logger.error("Failed to update user profile", error, {
            //   userId: userId.value,
            //   attempt: 2
            // });
            `
_ **Service Context:** Se possível, instâncias de `ILogger` injetadas devem ser configuradas com um contexto de origem (e.g., nome da classe/módulo) para que este seja automaticamente incluído nos logs.
_ **Justificativa:** Logs estruturados são fáceis de parsear, consultar e analisar por ferramentas de agregação de logs (e.g., ELK stack, Splunk, Datadog). Contexto adicional é vital para depuração e rastreamento de problemas.

**5. Logging por Camada/Ambiente:**
_ **`core/domain`:** Entidades e VOs geralmente NÃO DEVEM realizar logging direto usando `ILogger`. Sua responsabilidade é garantir o estado válido e lançar exceções de domínio (`EntityError`, `ValueError`) em caso de falha.
_ **`core/application` (Commands, Queries, Services):** Devem usar `ILogger` injetado para logar o início/fim de operações importantes, decisões de fluxo, tratamento de erros esperados e erros inesperados (capturando exceções do domínio ou da infraestrutura e logando-as antes de mapeá-las para `IUseCaseResponse`).
_ **`infrastructure/` (Repositórios, Adaptadores):** Devem usar `ILogger` para logar interações com sistemas externos (DBs, APIs), incluindo requisições (potencialmente com dados sensíveis anonimizados), respostas (resumidas), e erros.
_ **`presentation/electron/main.ts`:** Pode usar `ILogger` (uma vez configurado) para eventos do ciclo de vida da aplicação e operações do processo principal.
_ **`presentation/electron/preload.ts`:** Uso mínimo de `console.log` apenas para status de inicialização.
_ **`presentation/ui/` (Renderer Process):**
_ Pode usar uma instância leve de `ILogger` configurada para output no console do desenvolvedor.
_ Para erros críticos ou eventos que precisam ser persistidos/monitorados centralmente, deve usar um método exposto via `IPCService` para enviar a informação de log para o processo principal, que então usará sua instância `ILogger`.
_ **Exemplo (IPCService):** `ipcService.logErrorToMain("Error fetching projects", errorDetails);`
_ **Justificativa:** Adapta a estratégia de logging às responsabilidades e ao ambiente de cada camada.

**6. Logging de Jobs (`JobEntity.addLog()`):**
* **Distinção:** O método `JobEntity.addLog()` é para registrar um histórico operacional *específico da execução de um Job individual*. Esses logs são armazenados como parte dos dados do `JobEntity` (e.g., na coluna `logs` do banco de dados).
* **Não Substitui `ILogger`:** `job.addLog()` não substitui o uso de `ILogger` pelos serviços que processam o job (e.g., `WorkerService`, `GenericAgentExecutor`). Esses serviços ainda devem usar `ILogger` para seus próprios logs de diagnóstico e operacionais.
_ **Exemplo:** `WorkerService` pode usar `this.logger.info("Processing job X")` e também chamar `job.addLog("Processor started")`.
_ **Justificativa:** Separa o log de auditoria/progresso detalhado de um job específico do log geral da aplicação.

**7. Destino dos Logs e Configuração:**
_ **Desenvolvimento:** A implementação padrão do `ILogger` deve, no mínimo, logar para o console de forma legível, incluindo níveis e timestamps.
_ **Produção:** A implementação do `ILogger` deve ser configurável para:
_ Nível mínimo de log (e.g., `INFO` ou `WARN`).
_ Saída para arquivos (com rotação de logs) e/ou para um serviço de agregação de logs externo.
_ Formato estruturado (JSON).
_ A configuração da implementação do `ILogger` (e.g., qual logger concreto usar, seu nível, formato) deve ser gerenciada pela camada de infraestrutura e DI, não hardcoded. \* **Justificativa:** Flexibilidade para adaptar o logging às necessidades de cada ambiente sem alterar o código da aplicação.

**8. Dados Sensíveis:**
_ **Padrão:** NUNCA logar dados sensíveis em plain text. Isso inclui, mas não se limita a: senhas, chaves de API, tokens de sessão, informações de cartão de crédito, dados pessoais identificáveis (PII) não essenciais para o log.
_ **Estratégias:** Anonimização, truncamento, hashing (para identificadores), ou simplesmente não logar o dado. Se um objeto de contexto contiver dados sensíveis, filtre-o antes de passar para o logger. \* **Justificativa:** Segurança e conformidade com regulamentações de privacidade (LGPD, GDPR, etc.).

**9. Considerações de Performance:**
_ **Padrão:** Logging, especialmente síncrono ou para destinos lentos (disco, rede), pode impactar a performance.
_ Em caminhos críticos de performance, evite logging excessivo ou complexo, especialmente em níveis `DEBUG` ou `VERBOSE` que podem ser desabilitados em produção.
_ Implementações de logger para produção devem ser assíncronas ou usar buffers para minimizar o impacto na thread principal.
_ **Justificativa:** Manter a aplicação responsiva.

**Consequências:**

- Estratégia de logging unificada e consistente em toda a aplicação.
- Melhor capacidade de depuração, monitoramento e auditoria.
- Desacoplamento da lógica de logging da lógica de negócios.
- Maior controle sobre o volume e o destino dos logs em diferentes ambientes.
- Segurança aprimorada ao evitar o log de dados sensíveis.

---

**Notas de Implementação para LLMs:**

- Sempre que adicionar lógica de negócios ou interações significativas em Casos de Uso, Serviços ou Adaptadores, inclua chamadas ao `ILogger` injetado.
- Use `logger.error(message, error, context)` para erros capturados.
- Use `logger.warn(message, context)` para situações anormais que não param a execução.
- Use `logger.info(message, context)` para eventos importantes do fluxo.
- Use `logger.debug(message, context)` para informações detalhadas úteis apenas durante o desenvolvimento/depuração.
- Forneça objetos `context` ricos para facilitar a análise dos logs.
- NÃO use `console.log` ou similares diretamente.
