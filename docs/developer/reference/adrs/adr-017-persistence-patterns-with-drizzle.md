# ADR-017: Padrões de Persistência com Drizzle ORM

**Status:** Proposto (Considerado Aprovado Conforme Instrução)

**Contexto:**
A camada de persistência é responsável por salvar e recuperar dados do domínio de um banco de dados. O Project Wiz utiliza Drizzle ORM com SQLite. É crucial padronizar como as definições de esquema, implementações de repositório, mapeamento objeto-relacional, transações e tratamento de erros são gerenciados para garantir consistência, manutenibilidade e performance.

**Decisão:**

Serão adotados os seguintes padrões para a camada de persistência com Drizzle ORM:

**1. Definição de Esquemas de Tabela (`*.schema.ts`):**
    *   **Localização:** A definição de cada tabela (o schema Drizzle) pertence ao módulo de negócio que a gerencia. O arquivo `*.schema.ts` fica localizado dentro do diretório de persistência do seu respectivo módulo (ex: `src/main/modules/project-management/persistence/project.schema.ts`). As migrações SQL geradas, no entanto, são centralizadas em `src/main/persistence/migrations/` para garantir uma fonte única da verdade para a estrutura do banco de dados.
    *   **Nomenclatura:**
        *   **Tabelas:** Plural e `snake_case` (e.g., `jobs`, `user_profiles`).
        *   **Colunas:** `snake_case` (e.g., `queue_name`, `created_at`, `user_id`).
        *   **Arquivo:** `<nome-tabela-singular-kebab-case>.schema.ts` (e.g., `job.schema.ts`, `user-profile.schema.ts`).
    *   **Tipos de Coluna Padrão:**
        *   IDs (UUIDs de VOs): `text("id").primaryKey()` (o valor do VO é uma string UUID).
        *   Strings: `text("nome_coluna")`. Para VOs de string, armazenar `vo.value`.
        *   Números: `integer("nome_coluna")` ou `real("nome_coluna")`. Para VOs numéricos, armazenar `vo.value`.
        *   Booleanos: `integer("nome_coluna", { mode: "boolean" })`.
        *   Datas: `integer("nome_coluna", { mode: "timestamp_ms" })`. Armazenar como timestamp Unix em milissegundos (obtido de `date.getTime()`).
        *   **Objetos/Arrays Complexos (Payloads, Logs, Opções):** `text("nome_coluna", { mode: "json" })`.
            *   **Justificativa:** Oferece flexibilidade para armazenar estruturas de dados complexas ou variáveis sem requerer migrações de esquema de banco de dados para cada mudança interna nesses objetos. A validação da estrutura JSON é responsabilidade do domínio (VOs) antes da serialização e após a desserialização.
            *   **Consideração:** Dificulta consultas SQL diretas baseadas no conteúdo do JSON. Usar com critério.
    *   **Índices:** Definir índices (`index("nome_idx").on(...)`) para colunas frequentemente usadas em cláusulas `WHERE`, `ORDER BY`, ou `JOIN` para otimizar a performance de consultas.
    *   **Relações (Foreign Keys):** Usar `relations` do Drizzle para definir relações entre tabelas, o que pode facilitar queries mais complexas e garantir integridade referencial se o dialeto SQL suportar (SQLite suporta, mas precisa de `PRAGMA foreign_keys = ON;`).
    *   **Tipos Inferidos Drizzle:** Exportar e utilizar os tipos inferidos pelo Drizzle (`$inferInsert`, `$inferSelect`) nos mappers e repositórios para segurança de tipo.
        *   Exemplo: `export type JobInsert = typeof jobsTable.$inferInsert;`
    *   **Justificativa:** Padroniza a estrutura do banco de dados, melhora a performance com índices e garante consistência na representação de tipos de dados do domínio.

**2. Implementações de Repositório (`Drizzle[NomeEntidade]Repository.ts`):**
    *   **Localização:** `src/infrastructure/persistence/drizzle/<nome-entidade-kebab-case>/drizzle-[nome-entidade-kebab-case].repository.ts`.
        *   Exemplo: `src/infrastructure/persistence/drizzle/job/drizzle-job.repository.ts` (para a classe `DrizzleJobRepository`).
    *   **Injeção de Dependência:** Devem ser `@injectable()` e receber a instância do cliente Drizzle (`db: typeof DbType`) e quaisquer outros repositórios ou serviços necessários via construtor.
    *   **Implementação de `IRepository`:** Devem implementar a interface `I[NomeEntidade]Repository` definida no domínio (conforme ADR-011).

**3. Estratégia de Mapeamento Objeto-Relacional (ORM):**
    *   **Referência:** Alinhado com **ADR-010 (Padrões para Entidades e VOs)**.
    *   **Entidade para Persistência:**
        *   A entidade expõe um método `toPersistence()` que retorna um POJO (Plain Old JavaScript Object) contendo apenas primitivas ou valores serializáveis de seus VOs (e.g., `idVo.value`, `emailVo.value`).
    *   **Objeto de Persistência para Drizzle Input:**
        *   Um arquivo mapper co-localizado com o repositório (e.g., `drizzle-[nome-entidade-kebab-case].mapper.ts`) DEVE ser usado para converter o POJO de persistência da entidade para o formato esperado pelo Drizzle para inserção/atualização (e.g., mapeando nomes de propriedade camelCase para colunas snake_case).
        *   **Exemplo (`mapToDrizzleInput` em `drizzle-job.mapper.ts`):**
            ```typescript
            // export function mapToDrizzleInput(data: JobPersistenceData): JobInsert {
            //   return {
            //     id: data.id,
            //     queue_name: data.queueName, // Mapeamento de nome
            //     // ... outros campos ...
            //     options: JSON.stringify(data.options), // Serialização para JSON
            //     created_at: data.createdAt.getTime(), // Conversão de Date para timestamp
            //   };
            // }
            ```
    *   **Resultado Drizzle para Objeto de Persistência:**
        *   O mesmo mapper (`drizzle-[nome-entidade-kebab-case].mapper.ts`) DEVE ser usado para converter o resultado de uma consulta Drizzle (que reflete o esquema da tabela) de volta para o POJO de persistência da entidade.
        *   **Exemplo (`mapToPersistenceData` em `drizzle-job.mapper.ts`):**
            ```typescript
            // export function mapToPersistenceData(drizzleData: JobSelect): JobPersistenceData {
            //   return {
            //     id: drizzleData.id,
            //     queueName: drizzleData.queue_name,
            //     // ... outros campos ...
            //     options: typeof drizzleData.options === 'string' ? JSON.parse(drizzleData.options) : drizzleData.options, // Desserialização de JSON
            //     createdAt: new Date(drizzleData.created_at), // Conversão de timestamp para Date
            //   };
            // }
            ```
    *   **Objeto de Persistência para Entidade:**
        *   A reconstrução de Entidades a partir de dados de persistência (o inverso de `toPersistence()`) é responsabilidade da camada de Repositório ou, mais especificamente, de seus Mappers (`drizzle-[nome-entidade-kebab-case].mapper.ts`). O Mapper converterá os dados crus do Drizzle (`DrizzleSelect` object) para um POJO (`PersistenceData`) que contém os valores primitivos necessários. Em seguida, o Mapper (ou o Repositório) usará os construtores públicos da Entidade e de seus VOs para recriar as instâncias do domínio. Ex: `return new EntityConstructor(entityPropsComVOsInstanciados);` onde `entityPropsComVOsInstanciados` é montado após instanciar cada VO com `new VOxConstructor(valorPrimitivo)`.
    *   **Diagrama de Fluxo de Mapeamento (Escrita):**
        `Entidade.toPersistence()` -> `POJO de Persistência` -> `MapperInfra.mapToDrizzleInput()` -> `Objeto DrizzleInput` -> `DrizzleORM`
    *   **Diagrama de Fluxo de Mapeamento (Leitura):**
        `DrizzleORM` -> `Objeto DrizzleSelect` -> `MapperInfra.mapToPersistenceData()` -> `POJO de Persistência` -> `Mapper/Repositório (usa new VOs + new Entidade)` -> `Entidade`
    *   **Justificativa:** Separa claramente as responsabilidades de mapeamento. A entidade de domínio é responsável por converter seu estado para um POJO de persistência (`toPersistence()`). O mapper da infraestrutura lida com as especificidades do ORM/banco de dados (e.g., nomes de colunas snake_case, serialização de JSON, conversão de Date para timestamp e vice-versa). Crucialmente, o mapper (ou o repositório que o utiliza) agora também é responsável por tomar o POJO de persistência (após a leitura do banco de dados e mapeamento inicial pelo mapper) e usar os construtores públicos da Entidade e seus VOs para reconstruir as instâncias de domínio. Isso mantém a Entidade ignorante sobre os detalhes da reconstrução a partir de dados crus, alinhando-se com a remoção do método `fromPersistenceData` das Entidades (ADR-010).

**4. Semântica de `save` (Upsert):**
    *   **Padrão:** O método `save(entity: EntityType)` em repositórios Drizzle deve implementar uma lógica "upsert" usando ` .onConflictDoUpdate({ target: schema.table.id, set: drizzleInput })`.
    *   **Justificativa:** Simplifica a lógica do chamador, que não precisa verificar se a entidade já existe para decidir entre criar ou atualizar.

**5. Gerenciamento de Transações:**
    *   **Padrão:** Para operações que envolvem múltiplas escritas no banco de dados que devem ser atômicas, Drizzle ORM oferece `db.transaction(async (tx) => { ... })`.
    *   A responsabilidade por iniciar e gerenciar o escopo da transação (i.e., chamar `db.transaction()`) DEVE residir na camada de aplicação (Casos de Uso ou Serviços de Aplicação) que orquestra a unidade de trabalho.
    *   Os métodos de repositório individuais devem, por padrão, operar sem iniciar suas próprias transações, mas devem ser capazes de aceitar e usar uma instância transacional do cliente Drizzle (`tx`) se uma for passada pelo chamador.
    *   **Exemplo (Serviço de Aplicação):**
        ```typescript
        // class OrderService {
        //   constructor(private drizzle: typeof DbType, private orderRepo: IOrderRepository, private itemRepo: IItemRepository) {}
        //   async placeOrder(orderData: OrderData, itemsData: ItemData[]): Promise<void> {
        //     await this.drizzle.transaction(async (tx) => {
        //       // Passar 'tx' para os métodos de repositório se eles forem adaptados para aceitá-lo
        //       // ou se DrizzleJobRepository for instanciado com 'tx' em vez de 'db'
        //       const order = Order.create(orderData);
        //       await this.orderRepo.save(order, { transaction: tx }); // Exemplo de passagem de tx
        //       for (const item of itemsData) {
        //         // await this.itemRepo.updateStock(item.id, item.quantity, { transaction: tx });
        //       }
        //     });
        //   }
        // }
        ```
        (Nota: A passagem explícita de `tx` para cada método de repositório pode ser verbosa. Uma alternativa é o padrão Unit of Work, ou configurar a instância do repositório com o `tx` no início da transação.)
    *   **Justificativa:** Mantém as transações no escopo correto da unidade de trabalho definida pela aplicação, garantindo a atomicidade das operações de negócios.

**6. Tratamento de Erros de Banco de Dados:**
    *   **Padrão:** Implementações de repositório DEVEM capturar exceções específicas do Drizzle ORM ou do driver do banco de dados (e.g., erros de conexão, violações de constraint, deadlocks).
    *   Essas exceções DEVEM ser encapsuladas (wrapped) em um `InfrastructureError` (de `core/domain/common/errors.ts` ou `shared/errors/`) antes de serem relançadas. O erro original deve ser incluído na propriedade `originalError` do `InfrastructureError`.
    *   **Exemplo:**
        ```typescript
        // try {
        //   // await this.drizzleDbInstance.select().from(...);
        // } catch (err) {
        //   // this.logger.error("Database query failed", err);
        //   throw new InfrastructureError("Database query failed.", "DB_QUERY_ERROR", undefined, err as Error);
        // }
        ```
    *   **Justificativa:** Desacopla a camada de aplicação dos detalhes de erros da infraestrutura de persistência, conforme ADR-014.

**7. Uso de SQL Bruto (`sql` tag):**
    *   **Padrão:** Priorizar o uso do construtor de consultas tipado do Drizzle. SQL bruto (`sql\`...\`) só deve ser usado quando:
        *   A consulta é muito complexa para ser expressa de forma eficiente ou clara com o construtor de consultas.
        *   Para otimizações de performance específicas que não podem ser alcançadas de outra forma (após profiling).
        *   Para usar funções ou sintaxe SQL específicas do dialeto não diretamente suportadas pelo Drizzle de forma tipada.
    *   Se usado, deve ser encapsulado cuidadosamente e os parâmetros devem ser passados de forma segura para evitar injeção de SQL.
    *   **Justificativa:** O construtor de consultas do Drizzle oferece segurança de tipo e é mais fácil de manter. SQL bruto pode ser poderoso, mas menos seguro e mais difícil de refatorar.

**8. Cliente Drizzle (`drizzle.client.ts`):**
    *   **Padrão:** A instância do cliente Drizzle (`db`) e a conexão com o banco de dados (SQLite) devem ser inicializadas em um arquivo central (e.g., `src/infrastructure/persistence/drizzle/drizzle.client.ts`).
    *   Esta instância `db` deve ser exportada e usada para injeção nos repositórios (como visto no `inversify.config.ts`).
    *   **Justificativa:** Centraliza a configuração da conexão do banco de dados e fornece um singleton para o cliente Drizzle.

**9. Migrações (`drizzle-kit`):**
    *   **Padrão:** Utilizar `drizzle-kit` para gerar e gerenciar migrações de esquema do banco de dados.
    *   As migrações geradas devem ser versionadas no repositório (e.g., na pasta `src/infrastructure/persistence/drizzle/migrations/`).
    *   Um processo para aplicar migrações durante o deploy ou inicialização da aplicação deve ser definido.
    *   **Justificativa:** Ferramenta padrão do ecossistema Drizzle para gerenciamento de esquema de forma segura e versionada.

**Consequências:**
*   Consistência na interação com o banco de dados usando Drizzle ORM.
*   Clareza na estratégia de mapeamento entre domínio e persistência, alinhada com ADR-010.
*   Melhor tratamento de erros e transações.
*   Manutenção facilitada dos esquemas de banco de dados e repositórios.

---
**Notas de Implementação para LLMs:**
*   Ao criar um novo repositório Drizzle:
    *   Defina o esquema da tabela em `.../schema/[nome-tabela-singular-kebab-case].schema.ts`.
    *   Crie a classe `Drizzle[NomeEntidade]Repository` no arquivo `.../drizzle/[entidade-kebab-case]/drizzle-[entidade-kebab-case].repository.ts`.
    *   Implemente a interface `I[NomeEntidade]Repository`.
    *   Crie um mapper (`drizzle-[nome-entidade-kebab-case].mapper.ts`). Este mapper será responsável por: 1. Converter o POJO de persistência da entidade (de `toPersistence()`) para o formato de input do Drizzle. 2. Converter o resultado de uma query Drizzle (`DrizzleSelect`) para um POJO de persistência. 3. **Crucialmente, o mapper (ou o repositório que o utiliza) também será responsável por reconstruir a Entidade de domínio e seus VOs a partir do POJO de persistência, utilizando os construtores públicos `new VOx(valor)` e `new Entidade(propsComVOs)` (conforme ADR-010).**
    *   Use `db.transaction` nos Casos de Uso/Serviços para operações multi-escrita.
    *   Encapsule erros Drizzle em `InfrastructureError`.
