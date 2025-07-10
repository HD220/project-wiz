# ADR-028: Convenções Abrangentes de Nomenclatura (Mandato de Inglês no Código)

**Status:** Proposto (Considerado Aprovado Conforme Instrução - Revisado para kebab-case universal em `src/`)

**Contexto:**
Convenções de nomenclatura consistentes são fundamentais para a legibilidade, manutenibilidade e colaboração em qualquer projeto de software. Esta ADR consolida e formaliza todas as convenções de nomenclatura para identificadores de código, arquivos e diretórios em todo o Project Wiz, com um mandato explícito para o uso da língua inglesa em todos os identificadores de código.

**Decisão:**

As seguintes convenções de nomenclatura abrangentes serão adotadas:

**1. Mandato da Língua Inglesa no Código:**
_ **Padrão:** TODOS os identificadores no código-fonte (nomes de variáveis, funções, métodos, classes, interfaces, tipos, enums, parâmetros, módulos, arquivos e diretórios) DEVEM ser escritos em Inglês.
_ Comentários no código (quando absolutamente necessários, conforme ADR-016 e `coding-standards.md`) DEVEM também ser em Inglês.
_ Documentação voltada para o desenvolvedor (como esta ADR, `coding-standards.md`, `software-architecture.md`) será em Português, conforme o contexto do projeto. Documentação para usuários finais ou APIs públicas (se houver) pode ter outros requisitos de idioma.
_ **Justificativa:** Inglês é a língua franca no desenvolvimento de software, facilitando a colaboração com uma comunidade global, o uso de bibliotecas e ferramentas internacionais, e a compreensão por LLMs e outros desenvolvedores que podem não ser falantes de português. Evita codebases com idiomas misturados, que são difíceis de ler e manter.

**2. Convenções Gerais de Casing:**
_ **`camelCase`:**
_ **Uso:** Nomes de variáveis, parâmetros de função/método, nomes de funções, nomes de métodos.
_ **Exemplos:** `currentUser`, `totalAmount`, `calculatePrice(itemPrice, quantity)`, `userService.getUserProfile(userId)`.
_ **`PascalCase` (UpperCamelCase):**
_ **Uso:** Nomes de Classes, Interfaces, Tipos Aliases (Type Aliases), Enums.
_ **Exemplos:** `JobEntity`, `IUserRepository`, `PaymentDetails`, `OrderStatus`, `LoggerService`.
_ **`UPPER_SNAKE_CASE`:**
_ **Uso:** Constantes globais ou de módulo (valores fixos e imutáveis), membros de Enums (se os valores forem strings ou números significativos e a capitalização ajudar na distinção), Tokens de Injeção de Dependência (Symbols).
_ **Exemplos:** `MAX_RETRIES`, `DEFAULT_API_TIMEOUT_MS`, `OrderStatus.PENDING_PAYMENT`, `USER_REPOSITORY_TOKEN`.
_ **Justificativa:** Convenções amplamente adotadas na comunidade JavaScript/TypeScript, melhoram a legibilidade e ajudam a distinguir rapidamente o tipo de identificador.

**3. Convenções de Nomenclatura de Arquivos (Geral):**
_ **Padrão Principal:** **TODOS** os nomes de arquivos e pastas em `src/` DEVEM ser em `kebab-case`.
_ Extensões devem ser minúsculas (e.g., `.ts`, `.md`, `.json`, `.schema.ts`).
_ **Exemplos:**
_ `user-profile-card.tsx` (componente React)
_ `use-auth-session.hook.ts` (hook React)
_ `job.entity.ts` (entidade de domínio)
_ `generic-agent-executor.service.ts` (serviço de aplicação)
_ `user-notification.port.ts` (interface de porta)
_ **Sufixos Descritivos:** Usar sufixos padronizados, **obrigatoriamente**, para indicar o tipo/propósito principal do arquivo:
_ Entidades: `*.entity.ts` (e.g., `user.entity.ts`)
_ Objetos de Valor: `_.vo.ts`(e.g.,`email.vo.ts`, `job-id.vo.ts`)
        *   Interfaces de Repositório (Domínio): `_-repository.interface.ts`(e.g.,`job-repository.interface.ts`)
_ Outras Interfaces de Portas (Aplicação/Domínio): `*.port.ts` (e.g., `user-notification.port.ts`, `llm-generation.port.ts`)
_ Serviços (Aplicação, Domínio, Infraestrutura): `_.service.ts`(e.g.,`user-authentication.service.ts`, `job-processing.service.ts`)
        *   Repositórios (implementações): `_.repository.ts`(e.g.,`drizzle-user.repository.ts`)
_ Adaptadores (implementações): `*.adapter.ts` (e.g., `openai-llm.adapter.ts`)
_ Casos de Uso: `_.use-case.ts`(e.g.,`create-project.use-case.ts`)
        *   Esquemas Zod: `_.schema.ts`(e.g.,`create-project.schema.ts`)
_ Handlers (e.g., IPC, eventos): `*.handlers.ts` (e.g., `project.handlers.ts`)
_ Configurações: `_.config.ts`(e.g.,`database.config.ts`, `tailwind.config.ts`)
        *   Tipos (DTOs, definições de tipo específicas de módulo): `_.types.ts`(e.g.,`job.types.ts`, `ipc-shared.types.ts`)
_ Constantes: `*.constants.ts`
_ Utilitários: `_.utils.ts`ou`_.helpers.ts`
_ Componentes React: `*.tsx` (e.g., `user-profile-card.tsx`, `login-form.tsx`). (A extensão `.tsx` por si só já indica um componente React. O nome do arquivo deve ser descritivo e em kebab-case).
_ Hooks React: `use-_.hook.ts`(e.g.,`use-auth-session.hook.ts`, `use-form-validation.hook.ts`). O prefixo `use-`é parte do nome do arquivo.
    *   **Justificativa:** Consistência universal em`src/`é a prioridade máxima para nomes de arquivos e diretórios.`kebab-case` é URL-friendly, evita problemas de case-sensitivity entre sistemas operacionais e é um padrão comum. Sufixos de tipo mandatórios melhoram drasticamente a identificabilidade do conteúdo e propósito do arquivo sem a necessidade de abri-lo, facilitando a navegação e compreensão da estrutura do projeto.

**4. Convenções de Nomenclatura de Diretórios (Geral):**
_ **Padrão Principal:** TODOS os nomes de diretórios em `src/` DEVEM ser em `kebab-case`.
_ **Exemplos:** `core/domain/value-objects/`, `infrastructure/persistence/repositories/`, `presentation/electron/main-process/`, `features/user-profile/components/`.
_ **Exceção para Convenções de Frameworks:** Diretórios dentro de `src/presentation/ui/app/` (ou outra estrutura de páginas designada por um framework de roteamento) que são gerados ou rigidamente exigidos pelo framework de roteamento (e.g., TanStack Router para rotas dinâmicas como `$paramId` ou arquivos de layout especiais como `_layout.tsx`, `_auth.tsx`) podem seguir as convenções do framework. Todos os outros diretórios criados por desenvolvedores, mesmo dentro de `app/`, DEVEM seguir `kebab-case`.
_ **Justificativa:** Consistência com nomeação de arquivos, legibilidade e prevenção de problemas de case-sensitivity.

**5. Padrões de Nomenclatura Específicos por Tipo de Identificador:**
_ **Interfaces:**
_ **Padrão:** Usar `PascalCase` com um prefixo `I`.
_ **Exemplos:** `IUserRepository`, `ILLMAdapter`, `ICommand`, `IQuery`.
_ **Justificativa:** Convenção comum em muitas codebases TypeScript/C# que torna imediatamente claro que o tipo é uma interface. (Esta é uma decisão que formaliza a preferência vista em `IJobRepository` e outras interfaces de port).
_ **Classes Abstratas:**
_ **Padrão:** Usar `PascalCase` com um prefixo `Abstract`.
_ **Exemplos:** `AbstractEntity`, `AbstractQueue`, `AbstractLoggerService`.
_ **Justificativa:** Clarifica que a classe é destinada a ser herdada e não instanciada diretamente.
_ **Variáveis e Funções Booleanas:**
_ **Padrão:** Prefixo `is`, `has`, `should`, `can`, `did`, `will`.
_ **Exemplos:** `isActive`, `hasPermissions`, `shouldRetry`, `canExecute`, `didProcess`, `willClose`.
_ **Justificativa:** Torna o propósito booleano do identificador imediatamente óbvio.
_ **Funções/Métodos (Comportamento):**
_ **Com Efeitos Colaterais (Commands):** Geralmente verbos ou frases verbais no imperativo. Ex: `saveUser()`, `processPayment()`, `calculateTotal()`, `initializeService()`.
_ **Retornando Valores (Queries):** Podem ser substantivos se representarem o acesso a uma propriedade (comportando-se como getters), ou frases verbais com `get` ou `fetch` se envolverem busca ou cálculo. Ex: `user.email` (getter implícito), `projectService.getProjectDetails(id)`, `fetchUserData()`.
_ **Nomes de Eventos (EventEmitter):**
_ **Padrão:** `lowercase.dot.separated` ou `kebab-case`. A análise mostrou `job.added`, `queue.paused`. Vamos padronizar em `objeto.evento` (e.g., `job.added`, `user.profile.updated`).
_ **Justificativa:** Comum em sistemas de eventos, fácil de ler e agrupar.
_ **Tokens de DI (Symbols):**
_ **Padrão:** `[CONCEITO_EM_UPPER_SNAKE_CASE]_TOKEN`.
_ **Exemplo:** `USER_REPOSITORY_TOKEN`, `LOGGER_SERVICE_TOKEN`.
_ **Justificativa:** Clareza e evita colisão com nomes de variáveis.
_ **Esquemas Zod:**
_ **Padrão:** `[NomeDoObjetoOuDTO]Schema` (PascalCase com sufixo `Schema`).
_ **Exemplo:** `CreateUserInputSchema`, `JobPayloadSchema`.
_ **Justificativa:** Identifica claramente que o objeto é um esquema Zod.

**6. Clareza e Descritividade (Sem Abreviaturas Excessivas):**
_ **Padrão:** Nomes devem ser suficientemente longos para serem descritivos e inequívocos, mas não excessivamente verbosos. Evitar abreviações e acrônimos obscuros ou não padronizados no projeto.
_ **Abreviações Permitidas (Exemplos):** `Id`, `DTO` (Data Transfer Object), `VO` (Value Object), `URL`, `HTTP`, `HTML`, `JSON`, `UI`, `API`, `DB`, `Config`. Uma lista de abreviações comuns do projeto pode ser mantida se necessário.
_ Referência: Regra "Não Abreviar" do Object Calisthenics (ADR-016).
_ **Justificativa:** Código auto-documentável é mais fácil de entender e manter.

**7. Consistência Entre Camadas:**
_ **Padrão:** Estas convenções de nomenclatura DEVEM ser aplicadas consistentemente em todas as camadas e arquivos dentro de `src/`.
_ **Justificativa:** Uniformidade reduz a carga cognitiva e facilita a navegação e compreensão do código.

**Consequências:**

- Melhora significativa na legibilidade e manutenibilidade do código.
- Redução de ambiguidades e potencial para erros.
- Facilita a integração de novos desenvolvedores e a colaboração.
- Consistência que auxilia ferramentas de análise estática e refatoração.
- LLMs terão um padrão mais claro para seguir ao gerar ou modificar código.

---

**Notas de Implementação para LLMs:**

- TODOS os nomes de variáveis, funções, classes e outros identificadores de código DEVEM estar em Inglês e seguir as convenções de casing especificadas (camelCase, PascalCase, UPPER_SNAKE_CASE).
- TODOS os nomes de arquivos e diretórios que você criar ou modificar dentro de `src/` DEVEM estar em `kebab-case` e em Inglês.
- Use sufixos de tipo mandatórios e padronizados para todos os arquivos:
  - Componentes React: `meu-componente.tsx`
  - Hooks React: `use-minha-logica.hook.ts`
  - Entidades: `nome-entidade.entity.ts`
  - Objetos de Valor: `nome-vo.vo.ts`
  - Serviços: `nome-servico.service.ts`
  - Interfaces de Repositório: `nome-repositorio.interface.ts`
  - Outras Interfaces de Porta: `nome-porta.port.ts`
  - E assim por diante para `.schema.ts`, `.repository.ts`, `.adapter.ts`, `.use-case.ts`, `.types.ts`, etc.
- Para interfaces (tipos TypeScript), use o prefixo `I` (e.g., `IMyInterface`).
- Para booleanos, use prefixos como `is...`, `has...`, `should...`.
- Seja descritivo e evite abreviações desnecessárias.
- Em caso de dúvida sobre uma convenção específica, consulte esta ADR. A consistência é chave.
