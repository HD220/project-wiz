# ADR-028: Convenções Abrangentes de Nomenclatura (Mandato de Inglês no Código)

**Status:** Proposto (Considerado Aprovado Conforme Instrução - Revisado para kebab-case universal em `src/`)

**Contexto:**
Convenções de nomenclatura consistentes são fundamentais para a legibilidade, manutenibilidade e colaboração em qualquer projeto de software. Esta ADR consolida e formaliza todas as convenções de nomenclatura para identificadores de código, arquivos e diretórios em todo o Project Wiz, com um mandato explícito para o uso da língua inglesa em todos os identificadores de código.

**Decisão:**

As seguintes convenções de nomenclatura abrangentes serão adotadas:

**1. Mandato da Língua Inglesa no Código:**
    *   **Padrão:** TODOS os identificadores no código-fonte (nomes de variáveis, funções, métodos, classes, interfaces, tipos, enums, parâmetros, módulos, arquivos e diretórios) DEVEM ser escritos em Inglês.
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
    *   **Padrão Principal:** **TODOS** os nomes de arquivos e pastas em `src/` DEVEM ser em `kebab-case`.
        *   Extensões devem ser minúsculas (e.g., `.ts`, `.md`, `.json`, `.schema.ts`).
        *   **Exemplos:**
            *   `user-profile-card.tsx` (componente React)
            *   `use-auth-session.hook.ts` (hook React)
            *   `job.entity.ts` (entidade de domínio)
            *   `generic-agent-executor.service.ts` (serviço de aplicação)
            *   `user-notification.port.ts` (interface de porta)
    *   **Sufixos Descritivos:** Usar sufixos padronizados, **obrigatoriamente**, para indicar o tipo/propósito principal do arquivo:
        *   Entidades: `*.entity.ts` (e.g., `user.entity.ts`)
        *   Objetos de Valor: `*.vo.ts` (e.g., `email.vo.ts`, `job-id.vo.ts`)
        *   Interfaces de Repositório (Domínio): `*-repository.interface.ts` (e.g., `job-repository.interface.ts`)
        *   Outras Interfaces de Portas (Aplicação/Domínio): `*.port.ts` (e.g., `user-notification.port.ts`, `llm-generation.port.ts`)
        *   Serviços (Aplicação, Domínio, Infraestrutura): `*.service.ts` (e.g., `user-authentication.service.ts`, `job-processing.service.ts`)
        *   Repositórios (implementações): `*.repository.ts` (e.g., `drizzle-user.repository.ts`)
        *   Adaptadores (implementações): `*.adapter.ts` (e.g., `openai-llm.adapter.ts`)
        *   Casos de Uso: `*.use-case.ts` (e.g., `create-project.use-case.ts`)
        *   Esquemas Zod: `*.schema.ts` (e.g., `create-project.schema.ts`)
        *   Handlers (e.g., IPC, eventos): `*.handlers.ts` (e.g., `project.handlers.ts`)
        *   Configurações: `*.config.ts` (e.g., `database.config.ts`, `tailwind.config.ts`)
        *   Tipos (DTOs, definições de tipo específicas de módulo): `*.types.ts` (e.g., `job.types.ts`, `ipc-shared.types.ts`)
        *   Constantes: `*.constants.ts`
        *   Utilitários: `*.utils.ts` ou `*.helpers.ts`
        *   Componentes React: `*.tsx` (e.g., `user-profile-card.tsx`, `login-form.tsx`). (A extensão `.tsx` por si só já indica um componente React. O nome do arquivo deve ser descritivo e em kebab-case).
        *   Hooks React: `use-*.hook.ts` (e.g., `use-auth-session.hook.ts`, `use-form-validation.hook.ts`). O prefixo `use-` é parte do nome do arquivo.
    *   **Justificativa:** Consistência universal em `src/` é a prioridade máxima para nomes de arquivos e diretórios. `kebab-case` é URL-friendly, evita problemas de case-sensitivity entre sistemas operacionais e é um padrão comum. Sufixos de tipo mandatórios melhoram drasticamente a identificabilidade do conteúdo e propósito do arquivo sem a necessidade de abri-lo, facilitando a navegação e compreensão da estrutura do projeto.

**4. Convenções de Nomenclatura de Diretórios (Geral):**
    *   **Padrão Principal:** TODOS os nomes de diretórios em `src/` DEVEM ser em `kebab-case`.
    *   **Exemplos:** `core/domain/value-objects/`, `infrastructure/persistence/repositories/`, `presentation/electron/main-process/`, `features/user-profile/components/`.
    *   **Exceção para Convenções de Frameworks:** Diretórios dentro de `src/presentation/ui/app/` (ou outra estrutura de páginas designada por um framework de roteamento) que são gerados ou rigidamente exigidos pelo framework de roteamento (e.g., TanStack Router para rotas dinâmicas como `$paramId` ou arquivos de layout especiais como `_layout.tsx`, `_auth.tsx`) podem seguir as convenções do framework. Todos os outros diretórios criados por desenvolvedores, mesmo dentro de `app/`, DEVEM seguir `kebab-case`.
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
    *   **Padrão:** Estas convenções de nomenclatura DEVEM ser aplicadas consistentemente em todas as camadas e arquivos dentro de `src/`.
    *   **Justificativa:** Uniformidade reduz a carga cognitiva e facilita a navegação e compreensão do código.

**Consequências:**
*   Melhora significativa na legibilidade e manutenibilidade do código.
*   Redução de ambiguidades e potencial para erros.
*   Facilita a integração de novos desenvolvedores e a colaboração.
*   Consistência que auxilia ferramentas de análise estática e refatoração.
*   LLMs terão um padrão mais claro para seguir ao gerar ou modificar código.

---
**Notas de Implementação para LLMs:**
*   TODOS os nomes de variáveis, funções, classes e outros identificadores de código DEVEM estar em Inglês e seguir as convenções de casing especificadas (camelCase, PascalCase, UPPER_SNAKE_CASE).
*   TODOS os nomes de arquivos e diretórios que você criar ou modificar dentro de `src/` DEVEM estar em `kebab-case` e em Inglês.
*   Use sufixos de tipo mandatórios e padronizados para todos os arquivos:
    *   Componentes React: `meu-componente.tsx`
    *   Hooks React: `use-minha-logica.hook.ts`
    *   Entidades: `nome-entidade.entity.ts`
    *   Objetos de Valor: `nome-vo.vo.ts`
    *   Serviços: `nome-servico.service.ts`
    *   Interfaces de Repositório: `nome-repositorio.interface.ts`
    *   Outras Interfaces de Porta: `nome-porta.port.ts`
    *   E assim por diante para `.schema.ts`, `.repository.ts`, `.adapter.ts`, `.use-case.ts`, `.types.ts`, etc.
*   Para interfaces (tipos TypeScript), use o prefixo `I` (e.g., `IMyInterface`).
*   Para booleanos, use prefixos como `is...`, `has...`, `should...`.
*   Seja descritivo e evite abreviações desnecessárias.
*   Em caso de dúvida sobre uma convenção específica, consulte esta ADR. A consistência é chave.
