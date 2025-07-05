# ADR-028: Convenções Abrangentes de Nomenclatura (Mandato de Inglês no Código)

**Status:** Proposto (Considerado Aprovado Conforme Instrução)

**Contexto:**
Convenções de nomenclatura consistentes são fundamentais para a legibilidade, manutenibilidade e colaboração em qualquer projeto de software. Esta ADR consolida e formaliza todas as convenções de nomenclatura para identificadores de código, arquivos e diretórios em todo o Project Wiz, com um mandato explícito para o uso da língua inglesa em todos os identificadores de código. Ela referencia e complementa convenções específicas já mencionadas em outras ADRs (e.g., ADR-027 para arquivos de UI React).

**Decisão:**

As seguintes convenções de nomenclatura abrangentes serão adotadas:

**1. Mandato da Língua Inglesa no Código:**
    *   **Padrão:** TODOS os identificadores no código-fonte (nomes de variáveis, funções, métodos, classes, interfaces, tipos, enums, parâmetros, módulos, arquivos (exceto onde especificado), e diretórios) DEVEM ser escritos em Inglês.
    *   Comentários no código (quando absolutamente necessários, conforme ADR-016 e `coding-standards.md`) DEVEM também ser em Inglês.
    *   Documentação voltada para o desenvolvedor (como esta ADR, `coding-standards.md`, `software-architecture.md`) será em Português, conforme o contexto do projeto. Documentação para usuários finais ou APIs públicas (se houver) pode ter outros requisitos de idioma.
    *   **Justificativa:** Inglês é a língua franca no desenvolvimento de software, facilitando a colaboração com uma comunidade global, o uso de bibliotecas e ferramentas internacionais, e a compreensão por LLMs e outros desenvolvedores que podem não ser falantes de português. Evita codebases com idiomas misturados, que são difíceis de ler e manter.

**2. Convenções Gerais de Casing:**
    *   **`camelCase`:**
        *   **Uso:** Nomes de variáveis, parâmetros de função/método, nomes de funções, nomes de métodos.
        *   **Exemplos:** `currentUser`, `totalAmount`, `calculatePrice(itemPrice, quantity)`, `userService.getUserProfile(userId)`.
    *   **`PascalCase` (UpperCamelCase):**
        *   **Uso:** Nomes de Classes, Interfaces, Tipos Aliases (Type Aliases), Enums.
        *   **Exemplos:** `JobEntity`, `IUserRepository`, `PaymentDetails`, `OrderStatus`, `LoggerService`.
    *   **`UPPER_SNAKE_CASE`:**
        *   **Uso:** Constantes globais ou de módulo (valores fixos e imutáveis), membros de Enums (se os valores forem strings ou números significativos e a capitalização ajudar na distinção), Tokens de Injeção de Dependência (Symbols).
        *   **Exemplos:** `MAX_RETRIES`, `DEFAULT_API_TIMEOUT_MS`, `OrderStatus.PENDING_PAYMENT`, `USER_REPOSITORY_TOKEN`.
    *   **Justificativa:** Convenções amplamente adotadas na comunidade JavaScript/TypeScript, melhoram a legibilidade e ajudam a distinguir rapidamente o tipo de identificador.

**3. Convenções de Nomenclatura de Arquivos (Geral):**
    *   **Padrão Principal:** `kebab-case` para nomes de arquivos.
        *   Extensões devem ser minúsculas (e.g., `.ts`, `.md`, `.json`, `.schema.ts`).
        *   **Exemplos:** `job.entity.ts`, `user-repository.interface.ts`, `generic-agent-executor.service.ts`, `calculate-total.util.ts`, `auth.config.ts`, `project-routes.ts`.
    *   **Exceção Principal (Componentes React UI):** Arquivos de componentes React (`.tsx`) DEVEM usar `PascalCase.tsx` (conforme ADR-027). Ex: `UserProfileCard.tsx`.
    *   **Sufixos Descritivos:** Usar sufixos padronizados para indicar o tipo/propósito principal do arquivo:
        *   Entidades: `*.entity.ts` (e.g., `user.entity.ts`)
        *   Objetos de Valor: `*.vo.ts` (e.g., `email.vo.ts`, `job-id.vo.ts`)
        *   Interfaces (especialmente Ports): `*.interface.ts` (e.g., `job-repository.interface.ts`)
        *   Serviços: `*.service.ts` (e.g., `user.service.ts`, `ipc.service.ts`)
        *   Repositórios (implementações): `*.repository.ts` (e.g., `drizzle-user.repository.ts`)
        *   Adaptadores (implementações): `*.adapter.ts` (e.g., `openai-llm.adapter.ts`)
        *   Casos de Uso: `*.use-case.ts` (e.g., `create-project.use-case.ts`)
        *   Esquemas Zod: `*.schema.ts` (e.g., `create-project.schema.ts`)
        *   Handlers (e.g., IPC, eventos): `*.handlers.ts` (e.g., `project.handlers.ts`)
        *   Configurações: `*.config.ts` (e.g., `database.config.ts`, `tailwind.config.ts`)
        *   Tipos: `*.types.ts` (e.g., `job.types.ts`, `ipc-shared.types.ts`)
        *   Constantes: `*.constants.ts`
        *   Utilitários: `*.utils.ts` ou `*.helpers.ts`
        *   Hooks React: `use-*.hook.ts` ou `use*.ts` (ADR-027 tem preferência por `useCamelCase.ts`, esta ADR sugere consistência com kebab-case para arquivos não-componentes: `use-nome-hook.hook.ts`. **DECISÃO FINAL:** Manter `useCamelCase.ts` ou `usePascalCase.ts` para hooks como exceção ao kebab-case geral de arquivos `.ts` devido à forte convenção da comunidade React e para que o nome do arquivo espelhe o nome do hook exportado).
    *   **Justificativa:** `kebab-case` é URL-friendly, evita problemas de case-sensitivity entre sistemas operacionais e é comum para arquivos de configuração e scripts. Sufixos padronizados melhoram a identificabilidade do conteúdo do arquivo. Exceção para componentes React e hooks alinha-se com convenções do ecossistema.

**4. Convenções de Nomenclatura de Diretórios (Geral):**
    *   **Padrão Principal:** `kebab-case` para nomes de diretórios.
    *   **Exemplos:** `core/domain/value-objects/`, `infrastructure/persistence/repositories/`, `presentation/electron/main-process/`, `features/user-profile/components/`.
    *   **Exceção:** Diretórios em `presentation/ui/app/` que mapeiam para rotas dinâmicas do TanStack Router seguem a convenção do router (e.g., `$projectId`), conforme ADR-027.
    *   **Justificativa:** Consistência com nomeação de arquivos, legibilidade e prevenção de problemas de case-sensitivity.

**5. Padrões de Nomenclatura Específicos por Tipo de Identificador:**
    *   **Interfaces:**
        *   **Padrão:** Usar `PascalCase` com um prefixo `I`.
        *   **Exemplos:** `IUserRepository`, `ILLMAdapter`, `IUseCase`.
        *   **Justificativa:** Convenção comum em muitas codebases TypeScript/C# que torna imediatamente claro que o tipo é uma interface. (Esta é uma decisão que formaliza a preferência vista em `IJobRepository` e outras interfaces de port).
    *   **Classes Abstratas:**
        *   **Padrão:** Usar `PascalCase` com um prefixo `Abstract`.
        *   **Exemplos:** `AbstractEntity`, `AbstractQueue`, `AbstractLoggerService`.
        *   **Justificativa:** Clarifica que a classe é destinada a ser herdada e não instanciada diretamente.
    *   **Variáveis e Funções Booleanas:**
        *   **Padrão:** Prefixo `is`, `has`, `should`, `can`, `did`, `will`.
        *   **Exemplos:** `isActive`, `hasPermissions`, `shouldRetry`, `canExecute`, `didProcess`, `willClose`.
        *   **Justificativa:** Torna o propósito booleano do identificador imediatamente óbvio.
    *   **Funções/Métodos (Comportamento):**
        *   **Com Efeitos Colaterais (Commands):** Geralmente verbos ou frases verbais no imperativo. Ex: `saveUser()`, `processPayment()`, `calculateTotal()`, `initializeService()`.
        *   **Retornando Valores (Queries):** Podem ser substantivos se representarem o acesso a uma propriedade (comportando-se como getters), ou frases verbais com `get` ou `fetch` se envolverem busca ou cálculo. Ex: `user.email` (getter implícito), `projectService.getProjectDetails(id)`, `fetchUserData()`.
    *   **Nomes de Eventos (EventEmitter):**
        *   **Padrão:** `lowercase.dot.separated` ou `kebab-case`. A análise mostrou `job.added`, `queue.paused`. Vamos padronizar em `objeto.evento` (e.g., `job.added`, `user.profile.updated`).
        *   **Justificativa:** Comum em sistemas de eventos, fácil de ler e agrupar.
    *   **Tokens de DI (Symbols):**
        *   **Padrão:** `[CONCEITO_EM_UPPER_SNAKE_CASE]_TOKEN`.
        *   **Exemplo:** `USER_REPOSITORY_TOKEN`, `LOGGER_SERVICE_TOKEN`.
        *   **Justificativa:** Clareza e evita colisão com nomes de variáveis.
    *   **Esquemas Zod:**
        *   **Padrão:** `[NomeDoObjetoOuDTO]Schema` (PascalCase com sufixo `Schema`).
        *   **Exemplo:** `CreateUserInputSchema`, `JobPayloadSchema`.
        *   **Justificativa:** Identifica claramente que o objeto é um esquema Zod.

**6. Clareza e Descritividade (Sem Abreviaturas Excessivas):**
    *   **Padrão:** Nomes devem ser suficientemente longos para serem descritivos e inequívocos, mas não excessivamente verbosos. Evitar abreviações e acrônimos obscuros ou não padronizados no projeto.
    *   **Abreviações Permitidas (Exemplos):** `Id`, `DTO` (Data Transfer Object), `VO` (Value Object), `URL`, `HTTP`, `HTML`, `JSON`, `UI`, `API`, `DB`, `Config`. Uma lista de abreviações comuns do projeto pode ser mantida se necessário.
    *   Referência: Regra "Não Abreviar" do Object Calisthenics (ADR-016).
    *   **Justificativa:** Código auto-documentável é mais fácil de entender e manter.

**7. Consistência Entre Camadas:**
    *   **Padrão:** Estas convenções de nomenclatura (exceto as específicas de arquivos de UI React) devem ser aplicadas consistentemente em todas as camadas do projeto (`core`, `infrastructure`, `presentation`, `shared`).
    *   **Justificativa:** Uniformidade reduz a carga cognitiva e facilita a navegação e compreensão do código.

**Consequências:**
*   Melhora significativa na legibilidade e manutenibilidade do código.
*   Redução de ambiguidades e potencial para erros.
*   Facilita a integração de novos desenvolvedores e a colaboração.
*   Consistência que auxilia ferramentas de análise estática e refatoração.
*   LLMs terão um padrão mais claro para seguir ao gerar ou modificar código.

---
**Notas de Implementação para LLMs:**
*   TODOS os nomes de variáveis, funções, classes, arquivos (exceto componentes .tsx React) e diretórios que você criar ou modificar DEVEM estar em Inglês e seguir as convenções de casing especificadas (camelCase, PascalCase, UPPER_SNAKE_CASE, kebab-case).
*   Use sufixos de arquivo padronizados (`.entity.ts`, `.service.ts`, etc.).
*   Para interfaces, use o prefixo `I-` (e.g., `IMyInterface`).
*   Para booleanos, use prefixos como `is...`, `has...`.
*   Seja descritivo e evite abreviações desnecessárias.
*   Em caso de dúvida sobre uma convenção específica, consulte esta ADR ou a ADR relevante (e.g., ADR-027 para UI).
