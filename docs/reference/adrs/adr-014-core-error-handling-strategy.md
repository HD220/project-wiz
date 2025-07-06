# ADR-014: Estratégia Principal de Tratamento de Erros

**Status:** Proposto (Considerado Aprovado Conforme Instrução)

**Contexto:**
Uma estratégia de tratamento de erros robusta e consistente é essencial para a depuração, resiliência e comunicação clara de problemas na aplicação. Esta ADR define uma hierarquia de erros customizados e padrões para sua criação, propagação e tratamento, complementando o ADR-008 (Padrão de Resposta para Casos de Uso) e as menções em outras ADRs.

**Decisão:**

Serão adotados os seguintes padrões para o tratamento de erros:

**1. Classe Base `CoreError`:**
    *   **Padrão:** Será definida uma classe base abstrata `CoreError extends Error` (localizada em `src_refactored/shared/errors/core.error.ts` ou `src_refactored/core/common/errors.ts`).
    *   **Propriedades:**
        *   `name`: Nome da classe de erro (e.g., "EntityError", "ApplicationError").
        *   `message`: Mensagem descritiva do erro.
        *   `code?: string | number`: Um código de erro opcional, padronizado, para identificação programática do erro (e.g., "VALIDATION_ERROR", "RESOURCE_NOT_FOUND", "ERR_AUTH_001").
        *   `context?: Record<string, unknown>`: Um objeto opcional para carregar dados contextuais relevantes sobre o erro (e.g., IDs de entidades, parâmetros de entrada).
        *   `originalError?: Error`: Para encapsular o erro original de uma camada inferior ou de terceiros.
    *   **Construtor:** `constructor(message: string, code?: string | number, context?: Record<string, unknown>, originalError?: Error)`
    *   **Justificativa:** Fornece uma base comum para todos os erros customizados da aplicação, permitindo tratamento polimórfico e a inclusão de informações estruturadas.

**2. Tipos de Erro Customizados Específicos:**
    *   **Padrão:** Serão criadas classes de erro específicas que herdam de `CoreError` para diferentes categorias de falhas. Todas devem residir em `src_refactored/shared/errors/` ou `src_refactored/core/domain/common/errors.ts` e `src_refactored/core/application/common/errors.ts` conforme o escopo.
    *   **Exemplos Principais:**
        *   **`ValueError extends CoreError`:** Para falhas de validação em Objetos de Valor (VOs).
            *   `context` deve incluir os detalhes da falha (e.g., `zodError.flatten().fieldErrors`).
            *   `code` pode ser algo como `E_VALIDATION_VO`.
        *   **`EntityError extends CoreError`:** Para falhas de validação ou de regras de negócio em Entidades.
            *   `context` pode incluir ID da entidade e detalhes da falha.
            *   `code` pode ser algo como `E_ENTITY_VALIDATION` ou `E_ENTITY_RULE`.
        *   **`NotFoundError extends CoreError`:** Quando um recurso ou entidade específica não é encontrado.
            *   `message` deve indicar o tipo e o identificador do recurso (e.g., "User with ID '123' not found.").
            *   `context` deve incluir `{ entityName: string, entityId: string | number }`.
            *   `code`: `E_NOT_FOUND`.
        *   **`ApplicationError extends CoreError`:** Para erros genéricos na lógica da camada de aplicação (Casos de Uso, Serviços de Aplicação) que não se encaixam em outras categorias mais específicas.
            *   `code`: `E_APPLICATION`.
        *   **`InfrastructureError extends CoreError`:** Para falhas originadas na camada de infraestrutura (e.g., problemas de conexão com banco de dados, falha ao chamar API de terceiros, erro de I/O no sistema de arquivos).
            *   `message` deve descrever a falha da infraestrutura.
            *   `originalError` deve conter a exceção original da biblioteca ou sistema externo.
            *   `code`: `E_INFRASTRUCTURE`.
        *   **`AuthenticationError extends CoreError`:** Para falhas de autenticação (e.g., credenciais inválidas, token expirado/inválido).
            *   `code`: `E_AUTH_UNAUTHENTICATED`.
        *   **`AuthorizationError extends CoreError`:** Para falhas de autorização (e.g., usuário autenticado tenta acessar recurso sem permissão).
            *   `code`: `E_AUTH_UNAUTHORIZED`.
        *   **`ConfigurationError extends CoreError`:** Para erros relacionados a configurações ausentes ou inválidas da aplicação.
            *   `code`: `E_CONFIG`.
        *   **`LLMError extends InfrastructureError` (ou `CoreError`):** Erro específico para falhas na interação com LLMs (já visto em `MockLLMAdapter`).
            *   `code`: `E_LLM_REQUEST_FAILED`.
    *   **Justificativa:** Permite um tratamento de erro mais granular e específico, facilitando a depuração e a tomada de decisões programáticas baseadas no tipo de erro.

**3. Criação e Lançamento de Erros:**
    *   **Padrão:**
        *   Lançar (`throw`) instâncias desses erros customizados assim que a condição de erro for detectada.
        *   Preencher `message`, `code`, `context`, e `originalError` de forma apropriada.
    *   **Exemplo (`NotFoundError`):**
        ```typescript
        // Em um repositório ou serviço
        // if (!userRecord) {
        //   throw new NotFoundError("User", userId.value);
        // }
        ```
    *   **Justificativa:** Interrompe o fluxo de execução imediatamente ao detectar um erro, prevenindo processamento adicional com estado inválido.

**4. Encapsulamento de Erros (Wrapping):**
    *   **Padrão:** Ao capturar um erro de uma camada inferior (e.g., erro de um ORM na camada de infraestrutura) ou de uma biblioteca de terceiros, ele DEVE ser encapsulado (`wrapped`) em um erro customizado mais apropriado da hierarquia `CoreError` (e.g., `InfrastructureError`). O erro original DEVE ser passado para o parâmetro `originalError`.
    *   **Exemplo (Repositório):**
        ```typescript
        // try {
        //   // await drizzleDb.insert(...);
        // } catch (dbError) {
        //   throw new InfrastructureError("Failed to save user to database.", "DB_SAVE_ERROR", { userId: user.id.value }, dbError as Error);
        // }
        ```
    *   **Justificativa:** Abstrai os detalhes de implementação da camada inferior, previne o vazamento de exceções específicas de bibliotecas para as camadas superiores, e adiciona contexto de aplicação ao erro.

**5. Propagação de Erros:**
    *   **Padrão:** Erros customizados (instâncias de `CoreError`) são propagados através do lançamento (`throw`).
    *   Camadas de serviço ou casos de uso capturam esses erros e os utilizam para construir a parte `error` do `IUseCaseResponse`.
    *   Não se deve capturar um `CoreError` apenas para relançá-lo sem adicionar valor ou transformá-lo, a menos que seja na fronteira da aplicação (e.g., wrapper de Caso de Uso).
    *   **Justificativa:** Mantém um fluxo de erro claro e rastreável.

**6. Mapeamento para `IUseCaseResponse.error`:**
    *   **Padrão:** O `UseCaseWrapper` (conforme ADR-008 e ADR-012) é o principal responsável por capturar `CoreError` (e erros inesperados) e mapeá-los para a estrutura `IUseCaseErrorDetails` do `IUseCaseResponse`.
    *   O `name` do erro (e.g., "NotFoundError") deve ser usado para `error.name`.
    *   A `message` do erro para `error.message`.
    *   O `code` do erro para `error.code`.
    *   O `context` do erro pode ser mapeado para `error.details` ou usado para enriquecer a mensagem.
    *   **Justificativa:** Consistência na forma como os erros são reportados pela camada de aplicação.

**7. Serialização de Erros para IPC/Frontend:**
    *   **Padrão:** Ao enviar detalhes de erro para o frontend via IPC, certifique-se de que apenas informações seguras e relevantes sejam serializadas. Evite enviar objetos de erro completos se contiverem stack traces detalhados ou dados sensíveis em produção. A estrutura `IUseCaseErrorDetails` já promove isso.
    *   **Justificativa:** Segurança e para não expor detalhes internos da implementação.

**Consequências:**
*   Hierarquia de erros clara e padronizada.
*   Melhor depuração e rastreabilidade de problemas.
*   Comunicação de erros consistente entre camadas e para o frontend.
*   Desacoplamento de erros específicos de infraestrutura das camadas de aplicação e domínio.

---
**Notas de Implementação para LLMs:**
*   Ao implementar lógica que pode falhar, identifique o tipo de erro apropriado da hierarquia `CoreError` (ou crie um novo se necessário, herdando de `CoreError` ou um de seus filhos).
*   Sempre que capturar uma exceção de uma biblioteca ou de uma camada inferior, encapsule-a, passando o erro original no parâmetro `originalError`.
*   Preencha os campos `code` e `context` com informações relevantes para ajudar na depuração e no tratamento programático do erro.
*   Casos de Uso devem garantir que qualquer erro lançado seja devidamente mapeado para `IUseCaseResponse` pelo `UseCaseWrapper`.
