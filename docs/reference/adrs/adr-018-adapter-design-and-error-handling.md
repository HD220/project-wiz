# ADR-018: Padrões de Design e Tratamento de Erros para Adaptadores de Infraestrutura

**Status:** Proposto (Considerado Aprovado Conforme Instrução)

**Contexto:**
Adaptadores na camada de infraestrutura (`src_refactored/infrastructure/adapters/`) são responsáveis por encapsular a comunicação com serviços externos (e.g., LLMs, APIs de terceiros, gateways de pagamento, serviços de email). É crucial padronizar seu design, como lidam com erros, e seus contratos para garantir desacoplamento, testabilidade e um tratamento de falhas consistente. A análise do `MockLLMAdapter` revelou alguns padrões, incluindo o retorno de `IUseCaseResponse`.

**Decisão:**

Serão adotados os seguintes padrões para o design e implementação de Adaptadores:

**1. Propósito e Localização:**
    *   **Propósito:** Adaptadores medeiam a comunicação entre a aplicação (especificamente a camada de aplicação ou outros serviços de infraestrutura) e um sistema externo. Eles traduzem requisições da aplicação para o formato entendido pelo serviço externo e as respostas do serviço externo para um formato entendido pela aplicação.
    *   **Localização:** `src_refactored/infrastructure/adapters/<tipo_de_serviço_ou_nome_específico>/`. Ex: `src_refactored/infrastructure/adapters/llm/openai-llm.adapter.ts`.

**2. Definição da Interface (Porta):**
    *   **Padrão:** Cada adaptador DEVE implementar uma interface (porta) definida em `src_refactored/core/ports/adapters/`. Esta interface define o contrato que a camada de aplicação usará, abstraindo os detalhes do serviço externo específico.
    *   **Nomenclatura da Interface:** `I[NomeDoServiço/Funcionalidade]Adapter` (e.g., `ILLMAdapter`, `INotificationServiceAdapter`).
    *   **Nomenclatura do Arquivo da Interface:** `<nome-serviço-kebab-case>.adapter.interface.ts`.
    *   **Justificativa:** Princípio da Inversão de Dependência. A camada de aplicação depende da abstração (porta), não da implementação concreta do adaptador. Permite trocar implementações (e.g., de OpenAI para Anthropic) com impacto mínimo.

**3. Implementação do Adaptador:**
    *   **Injeção de Dependência (DI):** Adaptadores devem ser `@injectable()` e receber suas dependências (e.g., `ILogger`, objetos de configuração específicos do adaptador como API keys, URLs base) via construtor.
    *   **Cliente HTTP/SDK:** A lógica de interação com o serviço externo (usando `fetch`, Axios, ou um SDK específico do serviço) é encapsulada dentro do adaptador.
    *   **Tipos de Requisição/Resposta:** Os métodos do adaptador devem usar tipos definidos na interface da porta (que por sua vez podem ser tipos genéricos ou tipos definidos em `core/ports/adapters/types/` ou `shared/`).
    *   **Justificativa:** Mantém a lógica de interação com o externo isolada e testável. DI facilita a configuração e o mock.

**4. Tratamento de Erros (Fundamental):**
    *   **Padrão:**
        1.  Adaptadores DEVEM capturar todas as exceções provenientes da biblioteca cliente do serviço externo ou de chamadas de rede (e.g., erros de conexão, timeouts, erros HTTP 4xx/5xx).
        2.  Essas exceções DEVEM ser encapsuladas (wrapped) em um tipo de erro específico da aplicação, geralmente uma subclasse de `InfrastructureError` (conforme ADR-014), como `ThirdPartyServiceError` ou um erro mais específico como `LLMConnectionError`, `PaymentGatewayError`.
        3.  O erro original DEVE ser incluído na propriedade `originalError` do erro da aplicação.
        4.  Informações relevantes da resposta de erro do serviço externo (como `requestId`, código de erro do serviço) devem ser incluídas no `context` do erro da aplicação.
    *   **Exemplo:**
        ```typescript
        // try {
        //   // const response = await this.httpClient.post(this.config.apiUrl, data);
        // } catch (error) {
        //   // this.logger.error("LLM API request failed", error, { endpoint: this.config.apiUrl });
        //   // let errorCode = "LLM_UNKNOWN_ERROR";
        //   // if (error.response?.status === 401) errorCode = "LLM_AUTH_ERROR";
        //   // else if (error.response?.status === 429) errorCode = "LLM_RATE_LIMIT";
        //   // throw new InfrastructureError("LLM request failed.", errorCode, { originalStatus: error.response?.status }, error as Error);
        // }
        ```
    *   **Justificativa:** Desacopla a camada de aplicação dos detalhes de erros específicos de serviços externos. Fornece um conjunto consistente de tipos de erro para a aplicação tratar.

**5. Tipos de Retorno dos Métodos do Adaptador:**
    *   **Padrão:** Métodos de adaptadores que realizam uma consulta ou operação e retornam dados DEVEM retornar `Promise<OutputTipoEspecifico>`. Em caso de falha, eles DEVEM lançar uma das exceções customizadas (e.g., `InfrastructureError` ou sua subclasse) conforme definido no item 4.
    *   **NÃO usar `IUseCaseResponse` diretamente nos retornos de adaptadores.** O `MockLLMAdapter` usava `IUseCaseResponse`, mas esta prática será descontinuada para adaptadores. A responsabilidade de mapear o sucesso/falha de uma chamada de adaptador para `IUseCaseResponse` é do Serviço de Aplicação ou Caso de Uso que utiliza o adaptador.
    *   **Exemplo de Assinatura em Interface e Adaptador:**
        ```typescript
        // Interface: core/ports/adapters/llm-adapter.interface.ts
        // interface ILLMAdapter {
        //   generateText(messages: LanguageModelMessage[]): Promise<LanguageModelMessage>;
        // }

        // Adaptador: infrastructure/adapters/llm/openai-llm.adapter.ts
        // class OpenAILLMAdapter implements ILLMAdapter {
        //   async generateText(messages: LanguageModelMessage[]): Promise<LanguageModelMessage> {
        //     try {
        //       // ... lógica da API OpenAI ...
        //       // return mappedResponse;
        //     } catch (error) {
        //       // throw new InfrastructureError(...);
        //     }
        //   }
        // }
        ```
    *   **Justificativa:**
        *   Mantém os adaptadores focados em sua responsabilidade principal: interagir com o serviço externo e traduzir seus resultados/erros para o domínio da aplicação (tipos de dados e erros definidos pela aplicação).
        *   Desacopla os adaptadores da camada de aplicação e do DTO `IUseCaseResponse`. Adaptadores podem ser usados por outros serviços de infraestrutura que não necessariamente operam com `IUseCaseResponse`.
        *   A camada de aplicação (serviços/casos de uso) que chama o adaptador tem o contexto para decidir como tratar o sucesso ou a falha e construir o `IUseCaseResponse` apropriado.

**6. Logging:**
    *   **Padrão:** Adaptadores DEVEM usar a instância `ILogger` injetada para registrar informações sobre suas interações:
        *   `DEBUG` ou `VERBOSE`: Para detalhes da requisição (URL, headers principais, corpo anonimizado/resumido) e resposta completa (anonimizada/resumida).
        *   `INFO`: Para indicar o início e o fim de uma chamada externa, ou resultados de alto nível.
        *   `WARN`: Para respostas inesperadas do serviço externo que não são erros críticos, mas indicam um problema potencial (e.g., um campo depreciado na resposta).
        *   `ERROR`: Para todas as falhas capturadas, incluindo o erro original e contexto.
    *   **Dados Sensíveis:** NUNCA logar dados sensíveis em plain text (chaves de API, tokens de autenticação no corpo/headers, PII). Implementar mecanismos de redação ou filtragem para logs.
    *   **Justificativa:** Essencial para depuração de problemas de integração com serviços externos e para auditoria.

**7. Configuração do Adaptador:**
    *   **Padrão:** Configurações específicas do adaptador (URLs base, chaves de API, timeouts, etc.) devem ser injetadas via construtor, preferencialmente através de um objeto de configuração específico e tipado. Estes objetos de configuração são preenchidos a partir de variáveis de ambiente ou arquivos de configuração seguros (conforme ADR-XXX-ConfigurationManagement).
    *   **Justificativa:** Separa a configuração da lógica do adaptador, facilita a alteração de configurações entre ambientes (dev, staging, prod) e melhora a testabilidade.

**8. Implementações Mock para Testes e Desenvolvimento:**
    *   **Padrão:** Para cada interface de adaptador (`I[NomeServiço]Adapter`), uma implementação mock (e.g., `MockLLMAdapter`) DEVE ser fornecida em `src_refactored/infrastructure/adapters/<tipo_de_serviço_ou_nome_específico>/mock-[nome-serviço-kebab-case].adapter.ts`.
    *   O mock deve implementar a mesma interface e simular respostas realistas, incluindo casos de sucesso, diferentes tipos de dados e condições de erro.
    *   O DI container deve ser configurado para injetar a implementação real ou o mock dependendo do ambiente ou configuração de teste.
    *   **Justificativa:** Crucial para testes unitários e de integração dos serviços que dependem do adaptador, permite desenvolvimento frontend/backend desacoplado, e possibilita rodar a aplicação localmente sem dependência real de serviços externos (economizando custos e evitando instabilidade).

**9. Idempotência e Retentativas (Considerações):**
    *   **Retentativas:**
        *   Se o serviço externo é propenso a falhas transitórias (e.g., erros de rede, `503 Service Unavailable`, `429 Rate Limit Exceeded` com indicação de retry-after), o adaptador PODE implementar uma lógica de retentativa (e.g., com backoff exponencial).
        *   Esta lógica deve ser configurável (número de tentativas, delay inicial).
        *   Alternativamente, a responsabilidade de retentativa pode ser delegada para um serviço de aplicação mais genérico ou para a infraestrutura de execução de jobs, se a chamada ao adaptador ocorrer dentro de um job.
    *   **Idempotência (para operações de escrita):** Se o serviço externo suportar chaves de idempotência, o adaptador deve permitir que o chamador forneça tal chave e a inclua na requisição.
    *   **Decisão:** A implementação de retentativas no nível do adaptador deve ser avaliada caso a caso. Se a maioria das chamadas a adaptadores for feita por jobs que já possuem sua própria lógica de retentativa, pode ser redundante. Para chamadas síncronas diretas (e.g., de um handler IPC que chama um serviço de aplicação que chama um adaptador), retentativas no adaptador podem ser mais úteis. Esta ADR recomenda que a lógica de retentativa seja mínima no adaptador, a menos que o serviço externo tenha um padrão de retentativa muito específico e bem documentado que o adaptador possa encapsular de forma útil.
    *   **Justificativa:** Melhora a resiliência da integração. No entanto, a lógica de retentativa pode adicionar complexidade e deve ser implementada cuidadosamente para evitar sobrecarga desnecessária ao serviço externo.

**Consequências:**
*   Integrações com serviços externos serão mais robustas, consistentes e testáveis.
*   Clareza na responsabilidade de tradução de dados e tratamento de erros.
*   Menor acoplamento da aplicação aos detalhes de implementação de serviços de terceiros.
*   Facilidade em trocar implementações de adaptadores ou mocks.

---
**Notas de Implementação para LLMs:**
*   Ao integrar um novo serviço externo:
    1.  Defina a interface (porta) em `core/ports/adapters/`. O nome do arquivo da interface deve ser `<nome-serviço-kebab-case>.adapter.interface.ts`.
    2.  Crie a implementação concreta do adaptador em `infrastructure/adapters/`. O nome do arquivo do adaptador deve ser `<nome-serviço-kebab-case>.adapter.ts` ou `<provedor-especifico-nome-serviço-kebab-case>.adapter.ts`.
    3.  Implemente tratamento de erro robusto, encapsulando erros externos em `InfrastructureError` ou subclasses.
    4.  Decida sobre o tipo de retorno (Promise de tipo específico, NÃO `IUseCaseResponse`).
    5.  Adicione logging detalhado (com cuidado para dados sensíveis).
    6.  Crie uma implementação mock no arquivo `mock-[nome-serviço-kebab-case].adapter.ts`.
    7.  Configure a injeção de dependência no `inversify.config.ts`.
