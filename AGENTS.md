# Guia para Agentes LLM Trabalhando no Repositório Project Wiz

Bem-vindo, colega Agente LLM! Este documento é seu guia para entender e contribuir com o codebase do Project Wiz. Nosso objetivo é construir uma aplicação robusta, manutenível e de alta qualidade, e sua colaboração inteligente é fundamental.

## 1. Visão Geral do Projeto

O Project Wiz é uma aplicação desktop ElectronJS com frontend em React e backend/core em Node.js/TypeScript. Seu propósito é automatizar tarefas de desenvolvimento de software usando agentes de IA (como você!). Os agentes são configurados via "Personas" (`AgentPersonaTemplate`), processam "Jobs" (tarefas) de uma fila, e utilizam "Tools" (`IAgentTool`) para interagir com o sistema e o ambiente de desenvolvimento. O `GenericAgentExecutor` é o principal motor de processamento para os agentes.

**Leia com Atenção TODA A DOCUMENTAÇÃO RELEVANTE ANTES DE CADA TAREFA:**
*   **Compreensão Holística do Sistema:** Antes de iniciar QUALQUER tarefa de desenvolvimento ou refatoração, é **obrigatório** que você revise CUIDADOSAMENTE toda a documentação relevante na pasta `docs/`. Isso inclui, mas não se limita a:
    *   **Documentação Funcional Canônica:** `docs/funcional/` - Descreve O QUE o sistema faz. Entenda os objetivos de negócio e os fluxos de usuário.
    *   **Documentação Técnica Principal:** `docs/tecnico/` - Descreve COMO o sistema é construído. Preste atenção especial a:
        *   `docs/tecnico/arquitetura.md`: Detalha a Clean Architecture, camadas, e o fluxo de dependências.
        *   `docs/tecnico/requisitos.md`: Lista os Requisitos Funcionais (RF) e Não Funcionais (RNF) que sua implementação deve atender.
        *   `docs/tecnico/casos-de-uso/`: Detalha os principais fluxos de interação e como diferentes partes do sistema colaboram.
        *   `docs/tecnico/plano_refatoracao_codigo_fase5.md`: O plano que estamos seguindo para esta reescrita (se aplicável à sua tarefa).
    *   Outros documentos em `docs/` que possam ser pertinentes à sua tarefa específica (ex: ADRs em `docs/technical-documentation/adrs/`, guias de UI/UX se estiver trabalhando no frontend).
*   **Este Arquivo (`AGENTS.md`):** Seu guia principal para desenvolvimento, contendo princípios e padrões mandatórios.
*   **A Falha em Consultar a Documentação Adequadamente Resultará em Trabalho Desalinhado.** O objetivo desta leitura prévia é garantir que sua implementação esteja alinhada com os objetivos do sistema, a arquitetura definida, e os requisitos funcionais/não funcionais.

## 2. Princípios Arquiteturais Mandatórios

Aderência estrita aos seguintes princípios é crucial:

*   **Clean Architecture:** Conforme detalhado em `docs/tecnico/arquitetura.md`. As dependências devem sempre fluir para dentro (Infraestrutura -> Aplicação -> Domínio). O Domínio não conhece as camadas externas.
*   **Object Calisthenics:** Todas as 9 regras devem ser aplicadas rigorosamente. Veja a seção "Object Calisthenics em Detalhe" abaixo. Este é um RNF chave (RNF-COD-002).
*   **SOLID:**
    *   **S**ingle Responsibility Principle: Classes e métodos devem ter uma única responsabilidade bem definida.
    *   **O**pen/Closed Principle: Entidades devem ser abertas para extensão, mas fechadas para modificação.
    *   **L**iskov Substitution Principle: Subtipos devem ser substituíveis por seus tipos base.
    *   **I**nterface Segregation Principle: Clientes não devem depender de interfaces que não usam.
    *   **D**ependency Inversion Principle: Dependa de abstrações (interfaces/portas), não de implementações concretas.
*   **DRY (Don't Repeat Yourself):** Evite duplicação de código e lógica.
*   **KISS (Keep It Simple, Stupid):** Prefira soluções mais simples quando possível, sem sacrificar a clareza ou os princípios arquiteturais.

## 3. Estrutura do Código (em `src_refactored/` durante a Fase 5, depois `src/`)

Aderir à Clean Architecture:

*   `src_refactored/core/domain/`: Contém entidades, Value Objects, serviços de domínio puros e as *interfaces* (portas) para os repositórios. Ex: `job.entity.ts`, `project-id.vo.ts`, `project-repository.interface.ts`.
*   `src_refactored/core/application/`: Contém Casos de Uso (interactors), serviços de aplicação (que orquestram casos de uso ou lógica da aplicação), DTOs/schemas de entrada/saída (Zod), e as *interfaces* (portas) para adaptadores da camada de infraestrutura (ex: `IFileSystem`, `ILLMAdapter`). Ex: `create-project.use-case.ts`.
*   `src_refactored/core/ports/`: Diretório para interfaces genéricas de portabilidade que podem ser usadas tanto pelo domínio quanto pela aplicação, ou que não se encaixam estritamente em um deles (ex: `IAgentTool` em `core/tools/`).
*   `src_refactored/core/common/`: Utilitários e tipos base compartilhados pelas camadas do core (ex: `AbstractValueObject`, `Identity`, `DomainError`).
*   `src_refactored/infrastructure/`: Implementações concretas das portas definidas no Core.
    *   `persistence/drizzle/repositories/`: Implementações de repositórios (ex: `DrizzleProjectRepository`).
    *   `persistence/drizzle/schemas/`: Schemas Drizzle para o banco de dados.
    *   `tools/`: Implementações concretas de `IAgentTool` (ex: `FileSystemTool`, `TerminalTool`).
    *   `llm/`: Adaptadores para interagir com LLMs (ex: `AiSdkLLMAdapter`).
    *   `queue/`: Implementação da fila de Jobs.
    *   `worker-pool/`: Implementação do pool de workers.
    *   `ioc/`: Configuração de Injeção de Dependência (InversifyJS).
*   `src_refactored/presentation/`: Contém todo o código relacionado à apresentação ao usuário, incluindo a interface do usuário (UI) e a lógica específica da plataforma Electron.
    *   `electron/`: Código específico da plataforma Electron.
        *   `main/`: Lógica do Processo Principal do Electron (ponto de entrada, gerenciamento de janelas, configuração de IPC handlers, etc.).
        *   `preload/`: Scripts de Preload do Electron, que fornecem uma ponte segura entre o Processo Principal e os Processos de Renderer.
    *   `ui/`: Contém toda a aplicação frontend React.
        *   `index.html`: Ponto de entrada HTML para a aplicação React (servido pelo Vite para o renderer do Electron).
        *   `main.tsx`: Ponto de entrada TypeScript/React que inicializa a aplicação React, configura providers globais (Tema, Router, i18n, TanStack Query Client) e monta o componente raiz da UI no DOM.
        *   `assets/`: Recursos estáticos como imagens, fontes, etc.
        *   `components/`: Componentes React reutilizáveis:
            *   `common/`: Componentes genéricos e pequenos, altamente reutilizáveis (ex: `LoadingSpinner`, `ErrorFallback`).
            *   `layout/`: Componentes estruturais da UI (ex: `AppShell`, `MainSidebar`, `PageHeader`).
            *   `ui/`: Componentes base do Shadcn/UI, adicionados via CLI e customizados conforme necessário.
        *   `config/`: Configurações centrais da aplicação UI (ex: instância do TanStack Router, instância do QueryClient, setup do i18n).
        *   `features/`: Módulos de funcionalidades específicas da UI. Cada feature agrupa:
            *   `components/`: Componentes React reutilizáveis *dentro* daquela feature específica.
            *   `hooks/`: Hooks React específicos para a lógica da feature.
            *   `pages/`: Componentes de página completos para a feature.
            *   `services.ts`: (Opcional) Funções que encapsulam chamadas IPC específicas da feature.
            *   `types.ts`: (Opcional) Tipos TypeScript específicos da feature.
        *   `hooks/`: Hooks React globais, reutilizáveis em múltiplas features.
        *   `lib/`: Funções utilitárias puras (não-React) específicas do frontend.
        *   `services/`: Camada de abstração para comunicação com o backend (IPC), como `coreService.ts`.
        *   `store/`: Estado global do cliente não relacionado a servidor (ex: contextos de Tema, Autenticação).
        *   `styles/`: Arquivos de estilo globais, como `globals.css` contendo variáveis de tema Tailwind.
        *   `types/`: Definições de tipo TypeScript globais para o frontend.
        *   `routeTree.gen.ts`: Arquivo gerado pelo plugin Vite do TanStack Router.
*   `src_refactored/shared/`: Utilitários e tipos que podem ser compartilhados entre o backend (Electron main) e o frontend (Electron renderer), ex: `Result` type, tipos IPC.

## 4. Tecnologias Chave
Consulte `package.json` e `docs/tecnico/arquitetura.md` para a lista completa. As principais incluem:
*   **Linguagem:** TypeScript (configuração `strict`).
*   **Backend/Core:** Node.js.
*   **Desktop App:** ElectronJS.
*   **Frontend UI:** React, Vite, Tailwind CSS, Radix UI, ShadCN UI conventions.
*   **Roteamento (UI):** TanStack Router.
*   **i18n (UI):** LinguiJS.
*   **Formulários (UI):** React Hook Form + Zod.
*   **DI (Backend):** InversifyJS.
*   **Banco de Dados:** SQLite com Drizzle ORM.
*   **AI/LLM:** `ai-sdk`.
*   **Testes:** Vitest.

## 5. Fluxo de Trabalho de Desenvolvimento
*   **Implementação Orientada ao Domínio:** Comece definindo entidades e VOs no domínio, depois as portas de repositório. Em seguida, crie os casos de uso na camada de aplicação e, finalmente, implemente os adaptadores na infraestrutura.
*   **Testes Primeiro (TDD) ou Testes Imediatos:** Escreva testes unitários para VOs, entidades e casos de uso *antes* ou *imediatamente após* a implementação. Testes de integração para repositórios e serviços.
*   **Commits Pequenos e Incrementais:** Faça commits atômicos com mensagens claras (padrão Conventional Commits é preferido: `feat: ...`, `fix: ...`, `refactor: ...`, `docs: ...`, `test: ...`).
*   **Linting e Formatação:** Use `npm run lint` e `npm run format` (se configurado com Prettier) regularmente.
*   **Reutilização do Código Legado:** Consulte `src/` e `src2/` para entender a lógica existente. Você PODE reutilizar trechos de código, especialmente VOs bem definidos ou algoritmos puros, DESDE QUE eles sejam refatorados para se alinharem 100% com a nova arquitetura e TODOS os princípios (especialmente Object Calisthenics e tipagem TypeScript estrita). A prioridade é a REESCRITA limpa.

## 6. Object Calisthenics em Detalhe (Como Aplicar)

As 9 regras são mandatórias. Aqui estão algumas diretrizes contextuais:

1.  **Um Nível de Indentação por Método:**
    *   Extraia blocos `if`, `for`, `while`, `try/catch` para métodos privados ou funções auxiliares.
    *   Use guard clauses (retornos antecipados) para reduzir aninhamento.
2.  **Não Use a Palavra-Chave `else`:**
    *   Priorize guard clauses.
    *   Para lógica condicional mais complexa, considere polimorfismo (Strategy Pattern, State Pattern) ou mapeamentos.
3.  **Encapsule Todos os Tipos Primitivos e Strings:**
    *   **Value Objects (VOs):** Use para qualquer primitivo que tenha significado de domínio, regras de validação, ou comportamento associado (ex: `ProjectId`, `EmailAddress`, `JobStatus`, `RetryDelay`).
    *   **DTOs/Schemas Zod:** Para dados de entrada/saída de casos de uso e handlers IPC.
    *   **Exceções:** Primitivos são aceitáveis para variáveis de loop locais, contadores simples, ou strings que são verdadeiramente apenas "dados brutos" sem semântica de domínio (raro).
4.  **Coleções de Primeira Classe:**
    *   Se uma classe gerencia uma coleção (array, map, set) e tem lógica de negócios em torno dessa coleção (adicionar, remover, filtrar com regras específicas), crie uma classe dedicada para essa coleção (ex: `ActivityHistory`, `ToolNames`).
    *   A classe da coleção não deve ter outras variáveis de instância além da própria coleção.
5.  **Apenas Um Ponto Por Linha (Lei de Demeter):**
    *   Evite cadeias como `object.getA().getB().doC()`.
    *   Em vez disso, peça ao colaborador direto para fazer o trabalho: `object.doSomethingRelatedToC()`.
    *   Isso reduz o acoplamento. Cuidado especial em casos de uso orquestrando entidades.
6.  **Não Abrevie:**
    *   Use nomes completos e descritivos para classes, métodos, variáveis. `repository` em vez de `repo`. `index` é aceitável para contadores de loop.
7.  **Mantenha Todas as Entidades Pequenas:**
    *   **Classes:** Idealmente <50-100 linhas. Se maior, provavelmente tem múltiplas responsabilidades.
    *   **Métodos:** Idealmente <5-10 linhas. Se maior, extraia para métodos privados.
8.  **Nenhuma Classe Com Mais de Duas Variáveis de Instância:**
    *   Esta é a regra mais desafiadora, especialmente com DI.
    *   **Estratégias:**
        *   Agrupe dependências que servem a um único propósito coeso em um objeto de configuração/contexto e injete esse objeto.
        *   Se uma classe tem muitas dependências servindo a propósitos distintos, divida a classe em responsabilidades menores.
        *   Entidades frequentemente têm um `_id` (identidade) e um `props` (estado). VOs têm seus `props`.
9.  **Sem Getters/Setters/Propriedades (para comportamento):**
    *   **Comportamento sobre Dados:** Objetos devem expor métodos que realizam ações ("Tell, Don't Ask"), em vez de apenas fornecer acesso direto a dados internos para manipulação externa.
    *   **Value Objects:** Por convenção, VOs podem ter um método `value()` ou similar (ex: `idString()`, `nameString()`) para fornecer sua representação primitiva quando necessário para interagir com sistemas externos ou para persistência, mas o VO em si deve ser imutável. Isso não é um "getter" no sentido de expor estado interno para mutação arbitrária.
    *   **Entidades:** O estado interno (`props`) é privado. Mutações de estado ocorrem através de métodos comportamentais que retornam uma *nova instância* da entidade (ou atualizam `updatedAt` e retornam `this` se a entidade for conceitualmente mutável mas suas props VOs forem imutáveis).

## 7. Tratamento de Erros
*   Use o tipo `Result<T, E extends Error>` (de `shared/result.ts`) para operações que podem falhar.
*   Crie e use erros de domínio específicos (ex: `DomainError`, `ValidationError`, `NotFoundError`) que herdem de `Error`.
*   Evite `try/catch` genéricos que ocultam a natureza do erro. Capture exceções específicas.
*   A camada de Aplicação (Casos de Uso) é responsável por traduzir erros de domínio para erros de aplicação, se necessário.

## 8. Trabalhando com Código Legado (Durante a Fase 5)
*   O código legado em `src/` e `src2/` existe para consulta e entendimento.
*   **NÃO MODIFIQUE O CÓDIGO LEGADO.**
*   **TODO O NOVO CÓDIGO DEVE SER ESCRITO EM `src_refactored/`.**
*   Se você encontrar um VO, entidade, ou função utilitária no código legado que seja de alta qualidade e se alinhe PERFEITAMENTE com os novos princípios (Clean Arch, OC), você pode adaptá-lo para `src_refactored/`. No entanto, a **reescrita é a norma**.

## 9. Gerenciamento de Tarefas e Ciclo de Trabalho do Agente

O trabalho neste projeto é rastreado através de um sistema de tarefas localizado em `/.jules/`.

*   **Arquivo de Índice Principal (`/.jules/TASKS.md`):**
    *   Este arquivo contém uma tabela de alto nível de todas as tarefas, com status, dependências, prioridade e um link para o arquivo de detalhe da tarefa.
    *   Use este arquivo para obter uma visão geral do backlog e para identificar a próxima tarefa a ser trabalhada com base nas prioridades e dependências.
*   **Arquivos de Detalhes da Tarefa (`/.jules/tasks/TSK-[ID_DA_TAREFA].md`):**
    *   Cada tarefa listada no índice possui um arquivo Markdown correspondente na subpasta `/.jules/tasks/`.
    *   O nome do arquivo segue o padrão `TSK-[ID_DA_TAREFA].md`.
    *   **Este arquivo de detalhe é a fonte canônica de informação para uma tarefa específica.** Ele contém a descrição completa, critérios de aceitação, notas de design, comentários e outros metadados relevantes.
    *   **Sempre consulte o arquivo de detalhe da tarefa antes de iniciar a implementação.**
*   **Seu Ciclo de Trabalho (Conforme `/.jules/AGENT_WORKFLOW.md`):**
    1.  **Fase 1: Sincronização e Análise:**
        *   Leia o `/.jules/TASKS.md` (arquivo de índice) para entender o estado atual do projeto.
    2.  **Fase 2: Seleção da Próxima Ação:**
        *   **Desmembrar Tarefas Complexas:** Procure a primeira tarefa `Pendente` no `TASKS.md` com `Complexidade > 1` (a complexidade estará no arquivo de detalhe da tarefa, mas pode ser inferida ou anotada brevemente no índice). Se encontrada, e suas dependências estiverem resolvidas, sua ação será desmembrá-la.
            *   Para desmembrar, leia o arquivo de detalhe da tarefa mãe.
            *   Crie novos arquivos de detalhe para cada sub-tarefa em `/.jules/tasks/`.
            *   Atualize o `TASKS.md` principal: adicione as novas sub-tarefas como linhas no índice e marque o status da tarefa-mãe como "Bloqueado" ou "Subdividido".
        *   **Executar Tarefa Simples:** Se não houver tarefas para desmembrar, procure a primeira tarefa `Pendente` no `TASKS.md` com `Complexidade < 2` (ver arquivo de detalhe) cujas `Dependências` estejam todas com o status `Concluído`.
            *   Leia o arquivo de detalhe da tarefa selecionada em `/.jules/tasks/` para obter todas as especificações.
    3.  **Fase 3: Execução da Ação:**
        *   **Se Desmembrar:** Crie os arquivos de detalhe para as sub-tarefas. Atualize o `TASKS.md` (índice).
        *   **Se Executar:** Implemente a tarefa. Após a conclusão, atualize o *arquivo de detalhe da tarefa* (`/.jules/tasks/TSK-[ID].md`) com o status "Concluído", link do commit, notas, etc. Em seguida, atualize a linha correspondente no `TASKS.md` (índice) para "Concluído" e adicione o link do commit.
    4.  **Fase 4: Submissão:** Submeta todas as alterações, incluindo novos arquivos de detalhe, `TASKS.md` atualizado, e quaisquer outros arquivos de código ou documentação modificados.

Lembre-se, o objetivo é criar uma base de código exemplar. Pense cuidadosamente sobre cada decisão de design e implementação. Se algo não estiver claro, peça esclarecimentos.
