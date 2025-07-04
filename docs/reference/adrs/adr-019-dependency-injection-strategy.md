# ADR-019: Estratégia de Injeção de Dependência com InversifyJS

**Status:** Proposto (Considerado Aprovado Conforme Instrução)

**Contexto:**
A Injeção de Dependência (DI) é um padrão de design crucial para construir aplicações desacopladas, testáveis e manuteníveis. O Project Wiz utiliza InversifyJS como framework de DI. Esta ADR formaliza as convenções e padrões para o uso eficaz do InversifyJS em todo o projeto. A análise do arquivo `inversify.config.ts` e o uso de decoradores `@injectable` e `@inject` em várias classes formam a base desta decisão.

**Decisão:**

Serão adotados os seguintes padrões para a estratégia de Injeção de Dependência:

**1. Framework Padrão:**
    *   **Padrão:** InversifyJS é o framework de DI padrão para o Project Wiz. A biblioteca `reflect-metadata` deve ser importada no ponto de entrada da aplicação (e.g., `main.ts` para o processo principal, e potencialmente no início da configuração de testes) para permitir que o InversifyJS funcione corretamente com metadados de tipos e decoradores.
    *   **Justificativa:** InversifyJS é um container de DI leve, poderoso e popular para TypeScript, com bom suporte a decoradores e tipos.

**2. Configuração do Container:**
    *   **Padrão:** Um único container InversifyJS (`appContainer`) será criado e configurado centralmente no arquivo `src_refactored/infrastructure/ioc/inversify.config.ts`. Este container será responsável por gerenciar as dependências de toda a aplicação (para o processo principal do Electron).
    *   **Exportação:** O `appContainer` configurado será exportado para que possa ser usado no ponto de entrada da aplicação para resolver as dependências iniciais (e.g., registrar handlers IPC que precisam de serviços injetados).
    *   **Justificativa:** Centraliza a configuração de DI, tornando mais fácil entender como os componentes da aplicação são conectados.

**3. Chaves de Ligação (Tokens de Binding):**
    *   **Padrão:** Para vincular (bind) abstrações (interfaces) a implementações concretas, serão utilizados `Symbol` como tokens.
    *   **Nomenclatura de Tokens:** Os tokens `Symbol` devem seguir o padrão `[NOME_DA_INTERFACE_OU_CONCEITO_EM_MAIUSCULAS_SNAKE_CASE]_TOKEN`.
        *   Exemplo: `export const JOB_REPOSITORY_TOKEN = Symbol("IJobRepository");`
        *   Exemplo: `export const LOGGER_INTERFACE_TOKEN = Symbol("ILogger");` (Nota: `LOGGER_INTERFACE_TYPE` foi visto, padronizar para `_TOKEN`).
    *   **Localização de Tokens:** Tokens devem ser definidos e exportados junto com a interface que representam.
        *   Exemplo: `i-job-repository.interface.ts` define e exporta `JOB_REPOSITORY_TOKEN`.
    *   **Alternativa (Types em Objetos):** O uso de um objeto centralizado como `APPLICATION_TYPES` (visto para `IToolRegistryService`) é aceitável para agrupar tokens de um mesmo módulo ou camada, mas a preferência é por Symbols co-localizados com suas interfaces para melhor encapsulamento e "findability". Esta ADR recomenda a migração gradual para Symbols co-localizados.
    *   **Justificativa:** Symbols garantem unicidade e evitam conflitos de nomes que podem ocorrer com tokens baseados em string. Co-localização com a interface melhora a organização.

**4. Escopos de Binding:**
    *   **`inSingletonScope()`:**
        *   **Uso:** Para serviços, repositórios, adaptadores e outras classes que devem ter apenas uma instância durante todo o ciclo de vida da aplicação (ou do container). Esta é a escolha mais comum para a maioria dos serviços de backend.
        *   Exemplo: `appContainer.bind<ILogger>(LOGGER_INTERFACE_TOKEN).to(PinoLoggerService).inSingletonScope();`
    *   **`toConstantValue(instance)`:**
        *   **Uso:** Para vincular um token a uma instância já criada (e.g., a instância `db` do Drizzle ORM, ou uma configuração carregada externamente). Isso também resulta em um comportamento singleton para aquela instância específica.
        *   Exemplo: `appContainer.bind<IJobRepository>(JOB_REPOSITORY_TOKEN).toConstantValue(new DrizzleJobRepository(db));`
    *   **`inTransientScope()` (Padrão do InversifyJS se nenhum escopo for especificado):**
        *   **Uso:** Para classes onde uma nova instância deve ser criada toda vez que o token é resolvido. Usar com critério, geralmente para objetos leves, com estado volátil específico da requisição, ou quando o ciclo de vida é gerenciado externamente de forma muito curta. Não é o padrão para a maioria dos serviços/repositórios.
    *   **`toDynamicValue(context => ...)`:**
        *   **Uso:** Para cenários de instanciação complexos onde a criação do objeto requer lógica adicional, como resolver outras dependências do `context.container` ou realizar alguma configuração programática. Frequentemente usado com `inSingletonScope()` para garantir que a lógica dinâmica execute apenas uma vez.
        *   **Exemplo:** A configuração do `DrizzleQueueFacade` em `inversify.config.ts` é um bom exemplo.
    *   **Justificativa:** O escopo correto garante o gerenciamento eficiente de recursos e o comportamento esperado das instâncias (compartilhadas ou novas).

**5. Injeção de Dependências:**
    *   **Padrão Principal (Injeção via Construtor):** Classes que necessitam de dependências DEVEM recebê-las através de seus construtores. A classe deve ser decorada com `@injectable()`, e os parâmetros do construtor que representam dependências devem ser decorados com `@inject(TOKEN)`.
        ```typescript
        // @injectable()
        // class MyService {
        //   constructor(@inject(LOGGER_INTERFACE_TOKEN) private readonly logger: ILogger) {}
        // }
        ```
    *   **Injeção de Propriedade (`@inject()` em propriedades):** FORTEMENTE DESENCORAJADA. Deve ser evitada em favor da injeção via construtor.
        *   **Justificativa (Contra Injeção de Propriedade):** Torna as dependências da classe menos explícitas (não são visíveis na assinatura do construtor), pode dificultar os testes unitários (requer instanciar via container ou setar manualmente as propriedades), e pode levar a problemas se a ordem de instanciação não for gerenciada corretamente. Injeção via construtor é mais clara, segura e facilita testes.
    *   **Obrigatoriedade das Dependências:** Dependências injetadas via construtor são inerentemente obrigatórias para a instanciação da classe. Para dependências opcionais, use `@optional()` junto com `@inject()`, e o tipo do parâmetro deve permitir `undefined`.

**6. Instanciação Complexa em `toDynamicValue`:**
    *   **Padrão:** Ao usar `toDynamicValue` para construir um serviço complexo que internamente compõe outros sub-serviços (como visto no `DrizzleQueueFacade` que usa `QueueServiceCore`, `JobProcessingService`, `QueueMaintenanceService`):
        1.  **Preferência:** Os sub-serviços DEVEM também ser registrados no container InversifyJS e resolvidos via `context.container.get<Interface>(TOKEN_SUB_SERVICO)` dentro da função `toDynamicValue`.
        2.  **Alternativa (Menos Ideal):** A instanciação manual (`new SubServico(...)`) dentro de `toDynamicValue` é aceitável apenas se os sub-serviços são estritamente internos, não têm suas próprias dependências complexas, e não são esperados serem substituídos ou acessados individualmente fora do serviço principal que os compõe.
        *   A análise do `DrizzleQueueFacade` mostrou instanciação manual. Para maior flexibilidade e consistência de DI, a Opção 1 é preferível e deve ser o objetivo.
    *   **Justificativa (Preferência por Registrar Sub-Serviços):** Mantém a consistência da DI, permite que os sub-serviços também tenham suas dependências gerenciadas pelo Inversify, facilita a substituição de implementações de sub-serviços para testes ou diferentes configurações, e torna a configuração geral mais explícita no `inversify.config.ts`.

**7. Injeção de Configuração:**
    *   **Padrão:** Parâmetros de configuração para serviços (e.g., URLs de API, chaves, opções de comportamento) devem ser injetados através de objetos de configuração específicos e tipados, ou interfaces de configuração.
    *   Estes objetos de configuração podem ser vinculados no container usando `toConstantValue(configObjetoCarregado)` ou `toDynamicValue` se precisarem ser construídos a partir de múltiplas fontes (e.g., variáveis de ambiente + arquivos).
    *   Evitar injetar valores primitivos de configuração diretamente, a menos que sejam muito simples e isolados.
    *   **Exemplo:**
        ```typescript
        // interface IServiceConfig { apiKey: string; timeoutMs: number; }
        // const SERVICE_CONFIG_TOKEN = Symbol("IServiceConfig");
        // // ... carregar config de .env ou arquivo ...
        // // appContainer.bind<IServiceConfig>(SERVICE_CONFIG_TOKEN).toConstantValue(loadedConfig);
        // // @injectable()
        // // class MyExternalServiceAdapter {
        // //   constructor(@inject(SERVICE_CONFIG_TOKEN) private readonly config: IServiceConfig) {}
        // // }
        ```
    *   **Justificativa:** Desacopla os serviços dos detalhes de como a configuração é carregada. Facilita o gerenciamento de configurações para diferentes ambientes e melhora a testabilidade.

**8. Resolução de Dependências em Handlers IPC (Electron Main):**
    *   **Padrão:** Os handlers IPC registrados no `main.ts` do Electron, se precisarem de serviços ou casos de uso da camada de aplicação, devem obter instâncias desses serviços resolvendo-as a partir do `appContainer` no momento do registro do handler ou no início de cada chamada de handler (se o escopo do serviço não for singleton).
    *   **Exemplo (Conceitual):**
        ```typescript
        // import { appContainer } from "@/infrastructure/ioc/inversify.config";
        // import { CREATE_USER_USE_CASE_TOKEN, ICreateUserUseCase } from "@/core/application/use-cases/user/...";
        //
        // // No registro do handler:
        // // const createUserUseCase = appContainer.get<ICreateUserUseCase>(CREATE_USER_USE_CASE_TOKEN);
        // // ipcMain.handle(IPC_CHANNELS.CREATE_USER, async (_event, args) => {
        // //   return await createUserUseCase.execute(args);
        // // });
        ```
    *   **Justificativa:** Integra o sistema de DI com os pontos de entrada da aplicação (handlers IPC).

**9. Evitar Dependências Circulares:**
    *   **Padrão:** O design das classes e suas dependências deve evitar dependências circulares (A depende de B, e B depende de A). InversifyJS pode ter problemas para resolver tais dependências ou pode resolvê-las de forma inesperada.
    *   **Estratégias de Resolução/Prevenção:** Refatorar para extrair uma terceira classe da qual ambos dependem, usar injeção de propriedade (com cautela e apenas se absolutamente necessário e compreendido), ou repensar as responsabilidades das classes envolvidas.
    *   **Justificativa:** Dependências circulares geralmente indicam um problema de design (acoplamento excessivo ou responsabilidades mal definidas).

**10. Módulos de Container (`ContainerModule`):**
    *   **Padrão:** Para aplicações maiores, se o arquivo `inversify.config.ts` se tornar excessivamente grande e difícil de gerenciar, considerar o uso de `ContainerModule` do InversifyJS. Cada módulo da aplicação (e.g., "JobQueueModule", "UserManagementModule") pode definir suas próprias bindings em um `ContainerModule`, que é então carregado no `appContainer` principal.
    *   **Justificativa:** Melhora a organização e modularidade da configuração de DI em projetos complexos. (Não é estritamente necessário para o tamanho atual, mas é uma boa prática para escalabilidade).

**Consequências:**
*   Configuração de DI centralizada e padronizada.
*   Melhor testabilidade das classes devido à fácil substituição de dependências (mocking).
*   Redução do acoplamento entre componentes.
*   Ciclo de vida de objetos gerenciado de forma explícita e consistente.

---
**Notas de Implementação para LLMs:**
*   Sempre decore classes que precisam de DI com `@injectable()`.
*   Use injeção via construtor com `@inject(TOKEN)` para todas as dependências. Evite injeção de propriedade.
*   Defina tokens `Symbol` para cada interface que será injetada e exporte-os junto da interface.
*   Ao adicionar uma nova classe que precisa ser injetável (e.g., um novo Serviço, Repositório, Adaptador):
    1.  Defina sua interface e o token `Symbol` no local apropriado (e.g., `core/application/ports/` ou `core/domain/ports/`).
    2.  Implemente a classe, decorando-a com `@injectable()` e usando `@inject()` no construtor para suas dependências.
    3.  Adicione a ligação (binding) no `inversify.config.ts`, escolhendo o escopo apropriado (geralmente `inSingletonScope()`).
*   Para dependências complexas, considere se `toDynamicValue` é necessário ou se a classe pode ser simplificada para usar `to()` diretamente.
