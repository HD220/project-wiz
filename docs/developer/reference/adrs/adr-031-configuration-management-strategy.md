# ADR-031: Estratégia de Gerenciamento de Configuração

**Status:** Proposto (Considerado Aprovado Conforme Instrução)

**Contexto:**
Aplicações robustas necessitam de uma estratégia clara para gerenciar diferentes tipos de configuração, desde variáveis de ambiente e configurações de build até configurações específicas do usuário. Esta ADR define como as configurações serão carregadas, acessadas, validadas e protegidas no Project Wiz.

**Decisão:**

Serão adotados os seguintes padrões para o gerenciamento de configuração:

**1. Tipos de Configuração e Fontes:**

    *   **a. Configuração de Build/Estática:**
        *   **Descrição:** Configurações que afetam o processo de build ou são embutidas estaticamente na aplicação.
        *   **Exemplos:** `vite.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `eslint.config.js`, `drizzle.config.ts`.
        *   **Gerenciamento:** Mantidas como arquivos de configuração no repositório. Modificações são parte do versionamento do código.
    *   **b. Variáveis de Ambiente em Runtime:**
        *   **Descrição:** Configurações que podem variar entre ambientes (desenvolvimento, teste, produção) sem alterar o código.
        *   **Processo Principal (Main):**
            *   Carregadas de arquivos `.env` (e.g., `.env`, `.env.local`, `.env.production`) usando uma biblioteca como `dotenv` (ou `dotenv-expand`) no início do `main.ts`.
            *   Arquivos `.env` contendo segredos NÃO DEVEM ser versionados (adicionar ao `.gitignore`). Um arquivo `.env.example` DEVE ser versionado com placeholders.
            *   Acessadas via `process.env.NOME_DA_VARIAVEL`.
        *   **Processo de Renderização (UI):**
            *   Variáveis de ambiente expostas ao renderer DEVEM ser prefixadas com `VITE_` (e.g., `VITE_API_BASE_URL`).
            *   Acessadas via `import.meta.env.VITE_NOME_DA_VARIAVEL`.
            *   O Vite embute essas variáveis no build do frontend.
    *   **c. Configuração Persistida Específica do Usuário:**
        *   **Descrição:** Configurações que o usuário pode modificar através da UI e que são persistidas no banco de dados.
        *   **Exemplo:** `LLMProviderConfig` (entidade de domínio), preferências de tema da UI.
        *   **Gerenciamento:** Salvas e recuperadas através de repositórios e casos de uso, como qualquer outra entidade de domínio. Segredos (e.g., API Key do LLM do usuário) DEVEM ser criptografados usando `electron.safeStorage` antes de serem persistidos (ver ADR-030).
    *   **d. Configuração de Comportamento da Aplicação (Não específica do usuário):**
        *   **Descrição:** Configurações que definem o comportamento padrão da aplicação mas não são tipicamente alteradas pelo usuário final (e.g., opções padrão de job, limites de reintentativa, feature flags internas).
        *   **Gerenciamento:** Podem ser definidas em arquivos de configuração JSON/YAML dedicados (e.g., `app-config.json`) carregados pela aplicação na inicialização, ou como constantes em módulos TypeScript, ou injetadas via DI como objetos de configuração. Feature flags podem usar um sistema de feature flags dedicado se a complexidade aumentar.

**2. Acesso à Configuração:**

    *   **Padrão (Objetos de Configuração Tipados e Injetados):**
        *   EVITAR o uso direto de `process.env.MINHA_VARIAVEL` espalhado pelo código.
        *   Em vez disso, criar interfaces/classes de configuração tipadas para agrupar configurações relacionadas (e.g., `IApiConfig { apiUrl: string; apiKey: string; }`).
        *   No ponto de entrada da aplicação (e.g., `main.ts` ou na configuração do container DI), popular estas instâncias de objetos de configuração a partir de variáveis de ambiente, arquivos, ou valores padrão.
        *   Injetar estas instâncias de configuração tipadas nos serviços e componentes que delas necessitam, usando InversifyJS (conforme ADR-019).
        *   **Exemplo:**
            ```typescript
            // // Em um arquivo de configuração de tipos (e.g., core/config/types.ts)
            // export interface IDatabaseConfig { connectionString: string; poolSize: number; }
            // export const DATABASE_CONFIG_TOKEN = Symbol("IDatabaseConfig");

            // // Em inversify.config.ts
            // // const dbConfig: IDatabaseConfig = {
            // //   connectionString: process.env.DATABASE_URL || "default_connection_string",
            // //   poolSize: parseInt(process.env.DB_POOL_SIZE || "5")
            // // };
            // // appContainer.bind<IDatabaseConfig>(DATABASE_CONFIG_TOKEN).toConstantValue(dbConfig);

            // // Em um serviço
            // // @injectable()
            // // class MyRepository {
            // //   constructor(@inject(DATABASE_CONFIG_TOKEN) private readonly dbConfig: IDatabaseConfig) {
            // //     // usa this.dbConfig.connectionString
            // //   }
            // // }
            ```
    *   **Renderer (UI):** Para variáveis `VITE_`, o acesso via `import.meta.env.VITE_MINHA_VARIAVEL` é aceitável e padrão. Se estas precisarem ser usadas em múltiplos locais ou de forma mais estruturada, podem ser agrupadas em um serviço ou hook de configuração na UI.
    *   **Justificativa:** Promove type-safety, centraliza a lógica de leitura de configuração, facilita o mock para testes, e desacopla os componentes dos detalhes de onde a configuração vem (e.g., `process.env`).

**3. Validação de Configuração:**
    *   **Padrão:** Utilizar esquemas Zod para definir a estrutura e os tipos esperados para objetos de configuração, especialmente aqueles carregados de arquivos ou variáveis de ambiente.
    *   A validação DEVE ocorrer na inicialização da aplicação (e.g., ao popular os objetos de configuração tipados).
    *   Se configurações críticas estiverem ausentes ou inválidas, a aplicação DEVE falhar rapidamente (fail fast) com uma mensagem de erro clara indicando o problema de configuração.
    *   **Exemplo (Validação de `process.env` para um objeto de config):**
        ```typescript
        // const EnvSchema = z.object({
        //   NODE_ENV: z.enum(['development', 'production', 'test']),
        //   DATABASE_URL: z.string().url(),
        //   API_KEY_SERVICE_X: z.string().min(10),
        // });
        // try {
        //   const validatedEnv = EnvSchema.parse(process.env);
        //   // Proceder com a criação do objeto de configuração usando validatedEnv
        // } catch (error) {
        //   // console.error("Configuração de ambiente inválida!", error.flatten().fieldErrors);
        //   // process.exit(1);
        // }
        ```
    *   **Justificativa:** Garante que a aplicação inicie com uma configuração válida, prevenindo erros obscuros em runtime devido a configurações incorretas.

**4. Segurança para Configurações Sensíveis (Reforço do ADR-030):**
    *   **NÃO HARDCODAR SEGREDOS:** Chaves de API, senhas, tokens, etc., NUNCA devem estar no código-fonte.
    *   **Variáveis de Ambiente:** Usar para segredos, carregadas de arquivos `.env` (fora do VCS) ou injetadas pelo ambiente de CI/CD.
    *   **`electron.safeStorage`:** Para segredos fornecidos pelo usuário e que precisam ser persistidos localmente pela aplicação (e.g., `LLMProviderConfig.apiKey`), usar `safeStorage.encryptString()` e `safeStorage.decryptString()`. O acesso ao `safeStorage` deve ser encapsulado na camada de infraestrutura (e.g., no repositório que salva `LLMProviderConfig`).
    *   **Logging:** NUNCA logar valores de configuração sensíveis.
    *   **Justificativa:** Protege informações críticas contra exposição.

**5. Hierarquia e Sobrescritas (Overrides):**
    *   **Padrão (se aplicável):** Se a configuração puder vir de múltiplas fontes, definir uma ordem de precedência clara. Comum:
        1.  Valores padrão codificados (hardcoded defaults, menos preferível para segredos).
        2.  Valores de um arquivo de configuração base (e.g., `config.json`).
        3.  Valores de um arquivo de configuração específico do ambiente (e.g., `config.production.json`).
        4.  Variáveis de ambiente (geralmente têm a maior precedência).
    *   Bibliotecas como `convict` ou lógicas customizadas podem gerenciar essa hierarquia. Para o Project Wiz, iniciar com variáveis de ambiente (via `.env`) e defaults em código para objetos de configuração injetados é um bom começo.
    *   **Justificativa:** Flexibilidade para diferentes ambientes e configurações.

**6. Configuração para Diferentes Ambientes (`NODE_ENV`):**
    *   **Padrão:** Utilizar a variável de ambiente `NODE_ENV` (com valores como `development`, `production`, `test`) para controlar comportamentos específicos do ambiente (e.g., nível de log, abertura de DevTools, carregamento de diferentes arquivos `.env`).
    *   Vite (`import.meta.env.MODE`) também fornece o modo atual.
    *   **Justificativa:** Padrão comum para diferenciar comportamento em diferentes estágios do ciclo de vida da aplicação.

**7. Atualização de Configurações (Runtime):**
    *   **Configurações Persistidas pelo Usuário:** Alterações (e.g., em `LLMProviderConfig`) são tratadas como operações CRUD normais e devem ser refletidas na aplicação conforme a lógica de carregamento dessas configurações (e.g., recarregar ao usar, ou um sistema de cache/notificação).
    *   **Variáveis de Ambiente / Arquivos de Configuração:** Geralmente requerem reinício da aplicação para que as mudanças tenham efeito, a menos que um mecanismo de hot-reloading de configuração seja implementado (geralmente complexo e não necessário inicialmente).
    *   **Justificativa:** Clareza sobre como e quando as atualizações de configuração são aplicadas.

**Consequências:**
*   Gerenciamento de configuração centralizado, seguro e tipado.
*   Redução de erros devido a configurações inválidas ou ausentes.
*   Facilidade para configurar a aplicação para diferentes ambientes.
*   Melhor testabilidade devido à injeção de objetos de configuração.

---
**Notas de Implementação para LLMs:**
*   Ao adicionar uma nova configuração que varia por ambiente, use variáveis de ambiente. Para o frontend, prefixe com `VITE_`.
*   Crie interfaces/classes tipadas para agrupar configurações relacionadas. Popule-as a partir de `process.env` ou `import.meta.env` na inicialização ou na configuração de DI. Injete esses objetos, não use `process.env` diretamente nos serviços/componentes.
*   Use Zod para validar a estrutura e os tipos das suas configurações na inicialização.
*   Para segredos fornecidos pelo usuário que precisam ser salvos, garanta que a camada de persistência use `electron.safeStorage`.
*   NÃO inclua arquivos `.env` com segredos no versionamento. Use `.env.example`.
