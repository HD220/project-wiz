# ADR-011: Padrões para Interfaces de Repositório (Localização e Design)

**Status:** Proposto (Considerado Aprovado Conforme Instrução)

**Contexto:**
Interfaces de Repositório são um componente crucial da Clean Architecture, definindo o contrato entre a camada de domínio/aplicação e a camada de infraestrutura para persistência de dados. É vital padronizar sua localização, design e convenções para manter a consistência e clareza. A análise revelou inconsistências na localização atual (e.g., `IJobRepository` em `application/ports` vs. outras em `domain/<entidade>/ports`).

**Decisão:**

Serão adotados os seguintes padrões para todas as Interfaces de Repositório:

**1. Localização das Interfaces:**
    *   **Padrão:** Todas as interfaces de repositório DEVERÃO ser localizadas dentro da camada de domínio, especificamente em: `src_refactored/core/domain/<nome-da-entidade>/ports/<nome-da-entidade>-repository.interface.ts`.
        *   Exemplo: `src_refactored/core/domain/user/ports/user-repository.interface.ts` para `User`.
        *   Exemplo: `src_refactored/core/domain/job/ports/job-repository.interface.ts` para `Job`.
    *   **Justificativa:** Interfaces de repositório são contratos definidos PELA camada de domínio, especificando como as entidades de domínio devem ser persistidas e recuperadas. A camada de domínio "possui" esses contratos. A camada de aplicação utiliza essas interfaces, e a camada de infraestrutura as implementa. Esta localização reforça a Regra de Dependência da Clean Architecture (dependências fluem para dentro).

**2. Convenções de Nomenclatura:**
    *   **Nome do Arquivo:** `<nome-da-entidade-kebab-case>-repository.interface.ts`.
        *   Exemplo: `user-repository.interface.ts`
    *   **Nome da Interface:** `I[NomeDaEntidade]Repository` (PascalCase com prefixo `I-`).
        *   Exemplo: `interface IUserRepository { ... }`
    *   **Métodos:** `camelCase` (e.g., `findById`, `saveAll`).
    *   **Parâmetros:** `camelCase`.
    *   **Tokens de DI:** `[NOME_DA_ENTIDADE_UPPER_SNAKE_CASE]_REPOSITORY_TOKEN` (Symbol).
        *   Exemplo: `export const USER_REPOSITORY_TOKEN = Symbol("IUserRepository");`
    *   **Justificativa:** Consistência visual, clareza de propósito e alinhamento com convenções comuns em TypeScript e InversifyJS. O prefixo `I-` para interfaces é uma convenção amplamente reconhecida.

**3. Assinaturas de Método Padrão (CRUD e Comuns):**
    *   **`findById(id: <Entidade>IdVO): Promise<EntityType | null>`**
        *   Recebe o VO de ID da entidade.
        *   Retorna a entidade ou `null` se não encontrada. Não deve lançar erro "Not Found" diretamente.
    *   **`findAll(paginationOptions?: PaginationOptions): Promise<Array<EntityType>>` (Opcional, se aplicável)**
        *   Pode incluir opções de paginação e ordenação.
    *   **`save(entity: EntityType): Promise<void>`**
        *   **Semântica:** Deve funcionar como um "upsert". Se a entidade (baseado no ID) não existe, ela é criada. Se existe, é completamente atualizada com o estado da entidade fornecida.
        *   A entidade passada já deve estar em um estado válido conforme as regras de domínio.
    *   **`saveAll(entities: EntityType[]): Promise<void>` (Opcional, para operações em lote)**
        *   Semântica similar ao `save` para múltiplas entidades, idealmente transacional se o repositório suportar.
    *   **`delete(id: <Entidade>IdVO): Promise<void>`**
        *   Remove a entidade pelo ID. Deve ser idempotente (não falhar se a entidade já foi removida).
    *   **Justificativa:** Fornece um conjunto base de operações previsível e consistente para todas as entidades. A semântica de "upsert" para `save` simplifica a lógica do chamador que não precisa saber se é uma criação ou atualização.

**4. Parâmetros de ID:**
    *   **Padrão:** Métodos que operam sobre uma entidade específica via seu ID (e.g., `findById`, `delete`) DEVEM aceitar o Objeto de Valor (VO) de ID específico da entidade (e.g., `UserId`, `JobIdVO`) como parâmetro, não strings ou números primitivos.
    *   **Justificativa:** Reforça a type-safety, garante que apenas IDs válidos (já validados pelo VO) sejam usados, e alinha-se com o princípio de "Wrap All Primitives".

**5. Tipos de Retorno:**
    *   Todas as operações de repositório são inerentemente assíncronas e DEVEM retornar `Promise`.
    *   Para operações que buscam uma única entidade que pode não existir (e.g., `findById`), o retorno deve ser `Promise<EntityType | null>`.
    *   Para operações que buscam múltiplas entidades, o retorno deve ser `Promise<Array<EntityType>>` (retornar array vazio se nada for encontrado).
    *   Para operações de escrita (`save`, `delete`), o retorno deve ser `Promise<void>` se nenhum dado específico precisar ser retornado além da confirmação de sucesso/falha (implícita pela resolução/rejeição da Promise).
    *   **Justificativa:** Clareza sobre a natureza assíncrona e sobre a possibilidade de ausência de dados.

**6. Tratamento de Erros:**
    *   **Padrão:** Interfaces de repositório não devem vazar exceções específicas da camada de persistência (e.g., erros Drizzle, erros de conexão SQL).
    *   Implementações concretas de repositório (camada de infraestrutura) são responsáveis por capturar erros específicos da ferramenta de persistência e:
        1.  Mapeá-los para erros de domínio genéricos (e.g., `InfrastructureError`, `ConnectivityError` de `core/domain/common/errors.ts`) ou,
        2.  Em casos onde o erro é recuperável ou esperado (como uma falha de constraint única que pode ser tratada como um erro de negócio), podem retornar um resultado indicando a falha (e.g., um `Result<void, DomainError>` object), embora o padrão primário seja lançar exceções mapeadas.
    *   Métodos como `findById` retornam `null` para indicar "não encontrado", não lançam um erro. A camada de aplicação (caso de uso) decide se "não encontrado" é uma condição de erro.
    *   **Justificativa:** Decoupla o domínio e a aplicação de detalhes da infraestrutura, permitindo que a tecnologia de persistência seja trocada com impacto mínimo nas camadas superiores.

**7. Uso de Genéricos:**
    *   **Padrão:** Interfaces de repositório podem ser genéricas (e.g., `IRepository<TEntity, TId extends Identity>`) para funcionalidades muito comuns, mas repositórios específicos de entidade (e.g., `IUserRepository`) são preferidos para permitir métodos de consulta específicos do domínio dessa entidade. Se uma interface base genérica for usada, os repositórios específicos devem estendê-la.
    *   **Justificativa:** Repositórios específicos de entidade são mais explícitos e permitem a adição de métodos de consulta de negócios (e.g., `IUserRepository.findByEmail(email: UserEmail)`).

**8. Métodos de Consulta Específicos:**
    *   **Padrão:** Além dos métodos CRUD básicos, interfaces de repositório DEVEM incluir métodos para consultas específicas necessárias pelos casos de uso da aplicação, refletindo a linguagem do domínio.
    *   **Exemplo:** `IJobRepository` inclui `findNextJobsToProcess(...)`, `findStalledJobs(...)`.
    *   **Justificativa:** Mantém a lógica de consulta encapsulada na camada de persistência e fornece uma API clara para as necessidades da aplicação.

**Consequências:**
*   Localização padronizada e lógica para interfaces de repositório.
*   Nomenclatura e design consistentes em todas as interfaces.
*   Interação mais segura e type-safe com a camada de domínio.
*   Melhor desacoplamento entre domínio/aplicação e infraestrutura.

---
**Notas de Implementação para LLMs:**
*   Ao criar uma nova interface de repositório para uma entidade `MinhaEntidade` com ID `MinhaEntidadeIdVO`:
    *   Crie o arquivo em `src_refactored/core/domain/minha-entidade/ports/minha-entidade-repository.interface.ts`.
    *   Nomeie a interface `IMinhaEntidadeRepository`.
    *   Defina o token de DI: `export const MINHA_ENTIDADE_REPOSITORY_TOKEN = Symbol("IMinhaEntidadeRepository");`
    *   Implemente os métodos CRUD padrão (e.g., `findById(id: MinhaEntidadeIdVO): Promise<MinhaEntidade | null>`, `save(entity: MinhaEntidade): Promise<void>`, etc.).
    *   Adicione métodos de consulta específicos conforme a necessidade dos casos de uso.
