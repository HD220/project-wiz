# Arquitetura do Project Wiz: Um Sistema Orientado a Agentes de IA

## Introdução

Este documento detalha a arquitetura de software proposta para o "Project Wiz", uma plataforma de automação de engenharia de software orientada a agentes de IA. A arquitetura visa não apenas a robustez e escalabilidade, mas também a clareza extrema para desenvolvedores humanos e agentes de Inteligência Artificial (LLMs), garantindo facilidade de entendimento, manutenção e evolução.

Como Arquiteto de Software Sênior com mais de 20 anos de experiência, priorizo código auto-documentado, separação clara de responsabilidades e abstrações inteligentes para construir sistemas complexos que são, paradoxalmente, simples em sua essência.

---

## 1. Proposta de Arquitetura Geral

A arquitetura do Project Wiz é fundamentada em uma separação estrita de responsabilidades entre três componentes principais, cada um executando em seu próprio processo para garantir isolamento, segurança e escalabilidade:

1.  **UI (Renderer Process):** A camada de apresentação, responsável pela interação com o usuário.
2.  **Orquestração (Main Process):** O coração da aplicação Electron, gerenciando o ciclo de vida da aplicação, a comunicação inter-processos (IPC) e a orquestração de alto nível.
3.  **Motor de Agentes (Worker Process(es)):** O ambiente isolado onde a lógica pesada e autônoma dos agentes de IA é executada.

### 1.1. Interação de Alto Nível entre os Componentes

```mermaid
graph TD
    User[Usuário] -->|Interage com| UI(Renderer Process)
    UI -->|IPC (Solicitações/Eventos)| MainProcess(Main Process - Orquestrador)
    MainProcess -->|IPC (Comandos/Eventos)| WorkerProcesses(Worker Process(es) - Motor de Agentes)
    WorkerProcesses -->|IPC (Status/Resultados)| MainProcess
    MainProcess -->|IPC (Atualizações de UI)| UI
    MainProcess --o|Acessa diretamente| Database[SQLite + Drizzle ORM]
    WorkerProcesses --o|Acessa diretamente| Database
    WorkerProcesses --o|Interage com| FileSystem[Sistema de Arquivos do Projeto]
    WorkerProcesses --o|Interage com| LLMProviders[Provedores LLM (OpenAI, Anthropic, etc.)]
    WorkerProcesses --o|Interage com| Git[Repositório Git do Projeto]
```

### 1.2. Detalhamento dos Componentes e Seus Papéis

#### 1.2.1. UI (Renderer Process)

*   **Tecnologias:** React, TypeScript, TanStack Router, Tailwind CSS, Shadcn UI.
*   **Papel:** Esta camada é intencionalmente "burra". Sua única responsabilidade é:
    *   **Renderizar o Estado:** Exibir a interface do usuário com base nos dados recebidos do `Main Process`.
    *   **Capturar Entrada do Usuário:** Coletar interações do usuário (cliques, digitação, etc.).
    *   **Comunicar Intenções:** Enviar "intenções" ou "eventos de UI" para o `Main Process` via IPC, sem saber como essas intenções serão processadas.
*   **Diferencial:** A UI não deve conter lógica de negócio complexa, acesso direto a banco de dados ou chamadas a APIs externas (exceto talvez para recursos estáticos ou de UI que não impactam a lógica central). Isso garante que ela seja leve, reativa e fácil de testar e evoluir independentemente. A clareza para LLMs é maximizada aqui, pois o código é puramente declarativo e reativo.

#### 1.2.2. Orquestração (Main Process)

*   **Tecnologias:** Node.js, TypeScript, Electron API.
*   **Papel:** O `Main Process` é o cérebro e o centro de controle da aplicação. Suas responsabilidades incluem:
    *   **Gerenciamento do Ciclo de Vida da Aplicação:** Inicialização, encerramento, gerenciamento de janelas, menus, etc.
    *   **Gateway IPC:** Atuar como o ponto central para toda a comunicação inter-processos. Ele recebe solicitações da UI, as valida, roteia para os `Worker Processes` apropriados e envia atualizações de volta para a UI.
    *   **Gerenciamento de Estado Global (Não-UI):** Manter o estado da aplicação que não é diretamente ligado à UI, como configurações globais, status de autenticação, e o registro de `Worker Processes` ativos.
    *   **Acesso a Recursos do Sistema:** Gerenciar o acesso a recursos sensíveis como o banco de dados SQLite (Drizzle ORM) e, em alguns casos, orquestrar operações de sistema de arquivos que não são diretamente executadas pelos agentes (ex: criação inicial de diretórios de projeto).
    *   **Orquestração de Alto Nível:** Traduzir as "intenções" da UI em "comandos" ou "eventos" mais granulares para os `Worker Processes`. Por exemplo, uma intenção "Criar Projeto" da UI se traduz em um comando para o `Worker Process` de gerenciamento de projetos.
*   **Diferencial:** A clareza aqui reside na sua função de "roteador inteligente" e "guardião". Ele sabe quem pode falar com quem e o que cada um pode fazer. Isso é crucial para a segurança e para a rastreabilidade dos fluxos de dados. LLMs podem facilmente inferir o fluxo de controle e as permissões.

#### 1.2.3. Motor de Agentes (Worker Process(es))

*   **Tecnologias:** Node.js, TypeScript, Vercel AI SDK, Drizzle ORM (para acesso direto ao DB quando necessário), bibliotecas para manipulação de arquivos, Git, etc.
*   **Papel:** Este é o ambiente isolado onde a inteligência e a autonomia dos agentes de IA residem e operam. Cada `Worker Process` pode hospedar um ou mais agentes, ou ser dedicado a um tipo específico de agente ou tarefa de longa duração. Suas responsabilidades incluem:
    *   **Execução da Lógica do Agente:** Processar as tarefas delegadas pelo `Main Process`, que envolvem interação com LLMs, análise de código, manipulação de arquivos, execução de comandos Git, etc.
    *   **Isolamento de Recursos:** Garantir que as operações de um agente não afetem a estabilidade ou segurança de outros agentes ou do `Main Process`. Isso é vital para a robustez.
    *   **Acesso Controlado a Recursos:** Interagir com o sistema de arquivos (dentro do diretório do projeto), provedores LLM e, em alguns casos, o banco de dados (para persistir estados específicos do agente ou resultados de tarefas).
    *   **Relatar Progresso e Resultados:** Enviar atualizações de status, logs e resultados finais de volta para o `Main Process` via IPC.
*   **Diferencial:** A modularidade é a chave aqui. Cada agente é uma unidade autocontida, facilitando a adição de novos especialistas sem impactar o núcleo. O isolamento do processo garante que tarefas intensivas em recursos ou potencialmente instáveis (como interações com LLMs ou execução de código gerado) não derrubem a aplicação principal. Para LLMs, a estrutura de cada agente será padronizada, tornando a compreensão de novos agentes uma tarefa trivial.

### 1.3. Princípios Arquiteturais Chave

*   **Separação de Preocupações (SoC) Extrema:** Cada processo tem um conjunto bem definido de responsabilidades, minimizando acoplamento.
*   **Comunicação Assíncrona e Orientada a Eventos:** A comunicação entre processos será predominantemente assíncrona, usando um barramento de eventos IPC para desacoplamento e reatividade.
*   **Segurança por Design:** O `Main Process` atua como um gatekeeper, validando todas as solicitações antes de roteá-las. O `Worker Process` opera em um ambiente isolado com permissões mínimas necessárias.
*   **Escalabilidade Horizontal (para Workers):** A arquitetura permite a execução de múltiplos `Worker Processes` em paralelo, distribuindo a carga de trabalho dos agentes.
*   **Observabilidade:** Facilidade de monitorar o estado e o progresso das operações em todos os níveis, desde a UI até a execução do agente no worker.

Esta estrutura fornece uma base sólida para um sistema complexo, garantindo que cada parte seja compreensível, testável e evoluível, tanto para desenvolvedores humanos quanto para os próprios agentes de IA que um dia ajudarão a mantê-lo.

---

## 2. Estrutura de Diretórios Detalhada

Uma estrutura de diretórios clara e consistente é fundamental para a manutenibilidade e para a compreensão do sistema por humanos e LLMs. A proposta a seguir reflete a separação de responsabilidades e a modularidade da arquitetura.

```
project-wiz/
├───.agent-os/                 # Configurações e especificações do Agent OS (metadados do projeto)
├───.claude/                   # Configurações e agentes específicos do Claude (se aplicável)
├───docs/                      # Documentação do projeto (usuário, desenvolvedor, arquitetura)
├───src/
│   ├───main/                  # Código do Main Process (Orquestração)
│   │   ├───app/               # Lógica de inicialização e ciclo de vida da aplicação
│   │   ├───config/            # Configurações globais do Main Process
│   │   ├───database/          # Inicialização do DB, migrações, schemas Drizzle
│   │   ├───ipc/               # Handlers IPC para comunicação com Renderer e Workers
│   │   │   ├───handlers/      # Implementações dos handlers IPC
│   │   │   └───schemas/       # Schemas Zod para validação de payloads IPC
│   │   ├───features/          # Módulos de features do Main Process (ex: auth, user-management)
│   │   │   ├───auth/          # Lógica de autenticação e sessão
│   │   │   ├───projects/      # Gerenciamento de projetos (criação, listagem)
│   │   │   └───...
│   │   ├───lib/               # Utilitários e helpers gerais do Main Process
│   │   ├───types/             # Tipos globais do Main Process
│   │   └───workers/           # Gerenciamento e orquestração de Worker Processes
│   │       ├───manager.ts     # Lógica para iniciar, parar e monitorar Workers
│   │       └───schemas/       # Schemas para comunicação Main <-> Worker
│   ├───renderer/              # Código do Renderer Process (UI)
│   │   ├───app/               # Componentes e lógica de alto nível da aplicação UI
│   │   ├───assets/            # Imagens, ícones, fontes
│   │   ├───components/        # Componentes reutilizáveis da UI (shadcn/ui, custom)
│   │   │   ├───ui/            # Componentes shadcn/ui gerados
│   │   │   └───shared/        # Componentes customizados reutilizáveis
│   │   ├───config/            # Configurações específicas do Renderer
│   │   ├───features/          # Módulos de features da UI (ex: chat, dashboard, settings)
│   │   │   ├───chat/          # Componentes e lógica do chat
│   │   │   ├───dashboard/     # Componentes e lógica do dashboard
│   │   │   └───...
│   │   ├───hooks/             # Custom React Hooks
│   │   ├───lib/               # Utilitários e helpers gerais do Renderer
│   │   ├───locales/           # Arquivos de internacionalização (i18n)
│   │   ├───routes/            # Definições de rotas (TanStack Router)
│   │   ├───styles/            # Arquivos CSS globais e de tema
│   │   ├───types/             # Tipos globais do Renderer
│   │   └───main.tsx           # Ponto de entrada da aplicação Renderer
│   ├───shared/                # Código compartilhado entre Main, Renderer e Workers
│   │   ├───config/            # Configurações compartilhadas (ex: constantes, URLs de API)
│   │   ├───database/          # Schemas Drizzle compartilhados (definições de tabelas)
│   │   ├───events/            # Definições de eventos do Event Bus (IPC)
│   │   ├───logger/            # Configuração de logger compartilhada
│   │   ├───types/             # Tipos TypeScript compartilhados (interfaces de dados)
│   │   └───utils/             # Utilitários genéricos (ex: validação, formatação)
│   └───worker/                # Código do Worker Process (Motor de Agentes)
│       ├───app/               # Lógica de inicialização e ciclo de vida do Worker
│       ├───agents/            # Implementações dos agentes de IA
│       │   ├───base/          # Interface/Classe base para agentes
│       │   ├───code-analyst/  # Agente especialista em análise de código
│       │   ├───frontend-dev/  # Agente especialista em desenvolvimento frontend
│       │   ├───project-manager/ # Agente para gerenciamento de projetos
│       │   └───...
│       ├───config/            # Configurações específicas do Worker
│       ├───database/          # Acesso ao DB específico do Worker (se necessário)
│       ├───ipc/               # Handlers IPC para comunicação com Main Process
│       ├───lib/               # Utilitários e helpers gerais do Worker
│       ├───llm/               # Abstração e gerenciamento de provedores LLM
│       ├───processors/        # Lógica de processamento de tarefas para agentes
│       ├───queue/             # Gerenciamento de filas de tarefas para agentes
│       ├───tools/             # Implementação das ferramentas que os agentes podem usar (ex: file-system, git)
│       │   ├───file-system/   # Ferramentas para manipulação de arquivos
│       │   ├───git/           # Ferramentas para operações Git
│       │   └───...
│       ├───types/             # Tipos globais do Worker
│       └───worker.ts          # Ponto de entrada do Worker Process
├───tests/                     # Testes unitários e de integração
│   ├───main/                  # Testes para o Main Process
│   ├───renderer/              # Testes para o Renderer Process
│   └───worker/                # Testes para o Worker Process
├───package.json               # Dependências e scripts do projeto
├───tsconfig.json              # Configurações do TypeScript
├───vite.main.config.mts       # Configuração Vite para Main Process
├───vite.preload.config.mts    # Configuração Vite para Preload Script (se usado)
├───vite.renderer.config.mts   # Configuração Vite para Renderer Process
├───vite.worker.config.mts     # Configuração Vite para Worker Process
└───...
```

### 2.1. Explicação da Finalidade de Cada Pasta

*   **`.agent-os/`**: Contém metadados e especificações do sistema de agentes, como decisões de produto, roadmap e especificações de design de alto nível. É mais para documentação interna do Agent OS.
*   **`.claude/`**: Se houver configurações ou agentes específicos para o modelo Claude, eles residiriam aqui. Mantém a flexibilidade para provedores específicos.
*   **`docs/`**: Toda a documentação do projeto, incluindo guias de usuário, documentação para desenvolvedores e a própria documentação de arquitetura.
*   **`src/`**: O diretório principal do código-fonte, dividido logicamente pelos processos da aplicação.
    *   **`main/`**: Contém todo o código-fonte do **Main Process**. É o orquestrador central.
        *   **`app/`**: Lógica de inicialização da aplicação Electron, gerenciamento de janelas e ciclo de vida.
        *   **`config/`**: Arquivos de configuração específicos para o Main Process.
        *   **`database/`**: Lógica de inicialização do banco de dados (SQLite), scripts de migração e definições de schemas Drizzle que são manipulados diretamente pelo Main Process.
        *   **`ipc/`**: Contém os handlers para as comunicações Inter-Processo. É o ponto de entrada para as mensagens vindas do Renderer e dos Workers.
            *   **`handlers/`**: Implementações das funções que respondem às chamadas IPC.
            *   **`schemas/`**: Definições de schemas Zod para validação rigorosa dos payloads das mensagens IPC, garantindo segurança e tipagem.
        *   **`features/`**: Módulos que encapsulam a lógica de negócio de funcionalidades específicas do Main Process (ex: autenticação, gerenciamento de usuários, criação de projetos). Cada subpasta aqui representa uma feature coesa.
        *   **`lib/`**: Funções utilitárias e helpers genéricos que são usados em todo o Main Process.
        *   **`types/`**: Definições de tipos TypeScript que são específicos para o Main Process.
        *   **`workers/`**: Lógica para gerenciar o ciclo de vida dos Worker Processes (iniciar, parar, monitorar) e a comunicação de alto nível com eles.
    *   **`renderer/`**: Contém todo o código-fonte do **Renderer Process** (a interface do usuário).
        *   **`app/`**: Componentes React de alto nível que compõem a estrutura principal da aplicação UI.
        *   **`assets/`**: Recursos estáticos como imagens, ícones e fontes.
        *   **`components/`**: Componentes React reutilizáveis.
            *   **`ui/`**: Componentes gerados pelo `shadcn/ui`.
            *   **`shared/`**: Componentes React customizados que são reutilizáveis em diferentes partes da UI.
        *   **`config/`**: Arquivos de configuração específicos para o Renderer Process.
        *   **`features/`**: Módulos que encapsulam a lógica e os componentes de UI de funcionalidades específicas (ex: chat, dashboard, settings do usuário). Cada subpasta aqui representa uma feature coesa da UI.
        *   **`hooks/`**: Custom React Hooks para encapsular lógica de UI reutilizável.
        *   **`lib/`**: Funções utilitárias e helpers genéricos que são usados em todo o Renderer Process.
        *   **`locales/`**: Arquivos para internacionalização (i18n).
        *   **`routes/`**: Definições de rotas usando TanStack Router, geralmente com base em file-based routing.
        *   **`styles/`**: Arquivos CSS globais, definições de tema e utilitários Tailwind CSS.
        *   **`types/`**: Definições de tipos TypeScript que são específicos para o Renderer Process.
        *   **`main.tsx`**: O ponto de entrada principal da aplicação React.
    *   **`shared/`**: Contém código e definições que são **compartilhados** entre dois ou mais processos (Main, Renderer, Worker).
        *   **`config/`**: Constantes, URLs de API e outras configurações que precisam ser acessíveis por múltiplos processos.
        *   **`database/`**: As definições dos schemas Drizzle (tabelas, relações) que são usadas tanto pelo Main Process (para migrações e acesso principal) quanto pelos Workers (para acesso direto ao DB).
        *   **`events/`**: Definições de tipos e interfaces para os eventos que trafegam pelo Event Bus IPC, garantindo consistência.
        *   **`logger/`**: Configuração e abstração do sistema de logging, para que todos os processos loguem de forma consistente.
        *   **`types/`**: Interfaces TypeScript para modelos de dados e outras estruturas que são passadas entre processos.
        *   **`utils/`**: Funções utilitárias genéricas que não pertencem a nenhum processo específico (ex: validação de dados, formatação).
    *   **`worker/`**: Contém todo o código-fonte do **Worker Process** (o motor de agentes).
        *   **`app/`**: Lógica de inicialização e ciclo de vida do Worker Process.
        *   **`agents/`**: Onde as implementações dos agentes de IA residem. Cada subpasta é um tipo de agente.
            *   **`base/`**: Define a interface ou classe base para todos os agentes, garantindo um contrato comum.
            *   **`code-analyst/`**: Exemplo de um agente especialista em análise de código.
            *   **`frontend-dev/`**: Exemplo de um agente especialista em desenvolvimento frontend.
            *   **`project-manager/`**: Exemplo de um agente para gerenciamento de projetos.
        *   **`config/`**: Arquivos de configuração específicos para o Worker Process.
        *   **`database/`**: Lógica de acesso ao banco de dados específica do Worker, se houver necessidade de acesso direto (ex: para persistir memória do agente).
        *   **`ipc/`**: Handlers IPC para comunicação com o Main Process, recebendo comandos e enviando status.
        *   **`lib/`**: Funções utilitárias e helpers genéricos do Worker Process.
        *   **`llm/`**: Abstração e gerenciamento de provedores LLM (Vercel AI SDK), incluindo lógica de fallback e cache.
        *   **`processors/`**: Lógica de processamento de tarefas que os agentes utilizam. Pode ser onde a orquestração interna de um agente acontece.
        *   **`queue/`**: Implementação do sistema de filas de tarefas para os agentes, garantindo que as tarefas sejam processadas em ordem e isoladamente.
        *   **`tools/`**: Implementação das ferramentas que os agentes podem "usar" (funções que interagem com o ambiente externo).
            *   **`file-system/`**: Ferramentas para leitura/escrita de arquivos.
            *   **`git/`**: Ferramentas para operações Git (clone, commit, push).
        *   **`types/`**: Definições de tipos TypeScript que são específicos para o Worker Process.
        *   **`worker.ts`**: O ponto de entrada principal do Worker Process.
*   **`tests/`**: Contém os testes para cada parte da aplicação, espelhando a estrutura do `src/`.
*   **`package.json`**: Metadados do projeto, dependências e scripts.
*   **`tsconfig.json`**: Configurações do compilador TypeScript para todo o projeto.
*   **`vite.*.config.mts`**: Arquivos de configuração do Vite para cada processo, permitindo builds otimizados e independentes.

Esta organização visa a máxima clareza, permitindo que um desenvolvedor (ou LLM) localize rapidamente o código relevante para uma funcionalidade ou processo específico, e entenda suas dependências e responsabilidades. A duplicação de nomes de pasta como `config`, `lib`, `types` dentro de `main`, `renderer` e `worker` é intencional para reforçar a separação de contextos e evitar confusão sobre qual processo um arquivo pertence.

---

## 3. Padrões de Código e Paradigmas

Para garantir que o Project Wiz seja robusto, escalável e, crucialmente, fácil de entender e manter por humanos e LLMs, a adoção de padrões de código e paradigmas de programação consistentes é fundamental.

### 3.1. Princípios Gerais

*   **Código Auto-Documentado:** Priorizar nomes de variáveis, funções e classes que sejam expressivos e claros, minimizando a necessidade de comentários excessivos. O "porquê" deve ser documentado, o "o quê" deve ser evidente no código.
*   **Imutabilidade:** Sempre que possível, preferir estruturas de dados imutáveis para tornar o fluxo de dados mais previsível e reduzir efeitos colaterais.
*   **Programação Funcional (onde aplicável):** Utilizar funções puras, composição de funções e evitar estado mutável em contextos onde a lógica de negócio é complexa e a previsibilidade é crucial. Isso é especialmente útil em transformações de dados e lógica de processamento.
*   **Tipagem Forte (TypeScript):** Utilizar TypeScript de forma rigorosa para garantir a segurança de tipos em todo o codebase, com schemas Zod para validação em tempo de execução.

### 3.2. Padrões de Projeto Recomendados

#### 3.2.1. Command Query Responsibility Segregation (CQRS)

*   **Onde:** Principalmente no `Main Process` e nos `Worker Processes`.
*   **Papel:** Separar as operações que modificam o estado (Comandos) das operações que apenas leem o estado (Queries). Isso melhora a clareza, a escalabilidade e a testabilidade.
    *   **Comandos:** Representam intenções e ações (ex: `CreateProjectCommand`, `DelegateTaskCommand`). São processados por `CommandHandlers` que executam a lógica de negócio e modificam o estado.
    *   **Queries:** Representam solicitações de dados (ex: `GetProjectDetailsQuery`, `ListAgentsQuery`). São processadas por `QueryHandlers` que apenas leem dados, sem efeitos colaterais.
*   **Benefícios:** Facilita a compreensão do fluxo de dados (o que muda o quê), permite otimizações independentes para leitura e escrita, e simplifica a auditoria de ações.

#### 3.2.2. Observer Pattern (Event Bus)

*   **Onde:** Para comunicação assíncrona entre módulos dentro de um mesmo processo e, crucialmente, para a comunicação IPC entre `Main`, `Renderer` e `Worker`.
*   **Papel:** Um `Event Bus` centralizado (ou distribuído via IPC) permite que componentes se comuniquem sem ter conhecimento direto uns dos outros. Componentes publicam eventos, e outros componentes interessados se inscrevem para recebê-los.
*   **Benefícios:** Desacoplamento extremo, facilitando a adição de novas funcionalidades (novos listeners para eventos existentes) e a depuração de fluxos complexos. Essencial para a reatividade da UI e para o monitoramento do progresso dos agentes.

#### 3.2.3. Strategy Pattern

*   **Onde:** No `Worker Process`, para a lógica de execução dos agentes e para a integração com diferentes provedores LLM.
*   **Papel:** Definir uma família de algoritmos, encapsular cada um deles e torná-los intercambiáveis. Isso permite que o algoritmo varie independentemente dos clientes que o utilizam.
    *   **Exemplo 1 (LLM Providers):** Ter diferentes estratégias para interagir com OpenAI, Anthropic, DeepSeek, etc., todas implementando uma interface comum (`ILLMProvider`). O sistema pode então selecionar a estratégia apropriada em tempo de execução.
    *   **Exemplo 2 (Agent Behaviors):** Diferentes "comportamentos" ou "habilidades" de um agente podem ser implementados como estratégias, permitindo que um agente combine múltiplas habilidades de forma flexível.
*   **Benefícios:** Flexibilidade, extensibilidade (fácil adicionar novos provedores ou comportamentos de agente) e clareza na separação de algoritmos.

#### 3.2.4. Factory Pattern

*   **Onde:** No `Main Process` (para criar instâncias de `Worker Processes` ou agentes) e no `Worker Process` (para criar instâncias de ferramentas ou provedores LLM).
*   **Papel:** Fornecer uma interface para criar objetos em uma superclasse, mas permitir que as subclasses alterem o tipo de objetos que serão criados.
*   **Benefícios:** Desacopla o código cliente da lógica de criação de objetos, tornando o sistema mais flexível a mudanças na forma como os objetos são instanciados.

#### 3.2.5. Repository Pattern

*   **Onde:** No `Main Process` e nos `Worker Processes` (se acessarem o DB diretamente).
*   **Papel:** Abstrair a lógica de acesso a dados. Um repositório atua como uma coleção de objetos de domínio em memória, permitindo que o código cliente trabalhe com objetos de domínio sem se preocupar com os detalhes de persistência (SQL, ORM, etc.).
*   **Benefícios:** Facilita a troca de tecnologias de persistência, melhora a testabilidade (mocking do repositório) e centraliza a lógica de acesso a dados.

### 3.3. Paradigmas e Estilos de Programação

*   **Programação Orientada a Objetos (POO):** Para modelar entidades de domínio, agentes e serviços, utilizando classes e interfaces para definir contratos e hierarquias.
*   **Programação Funcional:** Para transformações de dados, utilitários e lógica sem estado, promovendo funções puras e imutabilidade.
*   **Injeção de Dependência (DI):** Para gerenciar as dependências entre os componentes, tornando o código mais modular, testável e flexível. Pode ser feito manualmente (passando dependências via construtor) ou com um container DI leve.

A combinação desses padrões e paradigmas, juntamente com a tipagem forte do TypeScript, criará um codebase que é não apenas funcional, mas também um modelo de clareza e manutenibilidade, ideal para a colaboração entre humanos e LLMs.

---

## 4. Gestão de Estado e Dados

A gestão eficiente do estado e dos dados é crucial para a performance, reatividade e manutenibilidade de uma aplicação complexa como o Project Wiz. A abordagem proposta integra `TanStack Router` para o estado da UI e `Drizzle ORM` para persistência de dados.

### 4.1. Gestão de Estado na UI (Renderer Process)

O `Renderer Process` é o responsável por gerenciar o estado da interface do usuário. A estratégia principal será:

*   **TanStack Router para Estado de Rota e Carregamento de Dados:**
    *   O `TanStack Router` não é apenas um roteador; ele é uma poderosa ferramenta para gerenciamento de estado de rota e, mais importante, para o carregamento de dados (`loader` functions).
    *   **`loader` functions:** Cada rota pode definir uma função `loader` que é responsável por buscar os dados necessários para aquela rota. Esses `loaders` podem fazer chamadas IPC para o `Main Process` para obter dados do banco de dados ou de outras fontes.
    *   **Cache e Sincronização:** O `TanStack Router` se integra perfeitamente com `TanStack Query` (anteriormente React Query), que será a principal biblioteca para cache e sincronização de estado do servidor na UI. Isso significa que os dados obtidos via IPC serão automaticamente cacheados, invalidados e atualizados conforme necessário, proporcionando uma experiência de usuário fluida e reativa.
    *   **Estado Local de Componentes:** Para o estado efêmero e local de componentes (ex: estado de formulários, toggles de UI), o `useState` e `useReducer` do React serão utilizados.
    *   **Context API:** Para compartilhar estado entre componentes que não estão diretamente relacionados por props, a Context API do React pode ser usada, mas com parcimônia para evitar re-renderizações desnecessárias.
*   **Fluxo de Dados na UI:**
    1.  Uma rota é ativada no `TanStack Router`.
    2.  A função `loader` da rota é executada, fazendo uma chamada IPC para o `Main Process` (ex: `ipcRenderer.invoke('get-project-details', projectId)`).
    3.  O `Main Process` busca os dados no banco de dados via `Drizzle ORM`.
    4.  Os dados são retornados via IPC para o `Renderer Process`.
    5.  `TanStack Query` armazena e gerencia o cache desses dados.
    6.  Os componentes React da rota consomem esses dados via `useQuery` ou `useLoaderData` do `TanStack Router`.

### 4.2. Gestão de Dados e Persistência (Main Process e Workers)

O `Drizzle ORM` será a ferramenta central para a interação com o banco de dados SQLite, garantindo tipagem forte e um DX (Developer Experience) excelente.

*   **Organização dos Schemas Drizzle:**
    *   Os schemas Drizzle (definições de tabelas, relações) devem residir em `src/shared/database/schema.ts`. Isso garante que as definições do banco de dados sejam compartilhadas e consistentes entre o `Main Process` (que gerencia migrações e acesso principal) e os `Worker Processes` (que podem precisar de acesso direto para persistência de memória de agentes ou logs específicos).
*   **Acesso ao Banco de Dados:**
    *   **Main Process (`src/main/database/`):**
        *   **Inicialização e Migrações:** O `Main Process` será o único responsável pela inicialização do banco de dados SQLite e pela execução das migrações do Drizzle. Isso garante que o schema do banco de dados esteja sempre atualizado e consistente.
        *   **Service Layer / Repositories:** O acesso aos dados será encapsulado em uma camada de serviços ou repositórios (seguindo o `Repository Pattern` mencionado na Seção 3). Por exemplo, `src/main/features/projects/project.repository.ts` ou `src/main/features/users/user.service.ts`.
        *   **Handlers IPC:** As funções que interagem com o banco de dados serão expostas ao `Renderer Process` através de handlers IPC (em `src/main/ipc/handlers/`). Esses handlers chamarão os métodos dos serviços/repositórios.
    *   **Worker Processes (`src/worker/database/`):**
        *   **Acesso Direto (Controlado):** Em alguns casos, os `Worker Processes` podem precisar de acesso direto ao banco de dados, por exemplo, para persistir a memória de longo prazo de um agente, logs de execução de tarefas ou resultados intermediários. Esse acesso deve ser configurado para usar o mesmo arquivo SQLite que o `Main Process`.
        *   **Repositórios Específicos do Worker:** Se um Worker precisar de acesso direto, ele terá seus próprios repositórios ou serviços de dados em `src/worker/database/` ou dentro de `src/worker/agents/[agent-name]/data/` para encapsular a lógica de acesso.
*   **Validação de Dados:**
    *   Todos os dados que entram ou saem da aplicação (via IPC, API, etc.) devem ser validados usando `Zod`. Isso garante a integridade dos dados e a segurança da aplicação. Os schemas Zod para validação de payloads IPC devem residir em `src/shared/events/schemas/` ou `src/main/ipc/schemas/` e `src/worker/ipc/schemas/`.

Esta abordagem centraliza a gestão de dados no `Main Process` para operações críticas e migrações, enquanto permite acesso controlado e tipado aos `Worker Processes` quando necessário, tudo isso com a segurança e a clareza proporcionadas pelo `Drizzle ORM` e `Zod`.

---

## 5. Comunicação Inter-Processos (IPC)

A comunicação inter-processos (IPC) é a espinha dorsal de qualquer aplicação Electron robusta. Para o Project Wiz, a IPC deve ser segura, eficiente e capaz de lidar com fluxos de dados em tempo real. Recomenda-se um padrão híbrido que combine a segurança do `contextBridge` com a flexibilidade de um `Event Bus`.

### 5.1. Padrão IPC Recomendado

#### 5.1.1. Renderer <-> Main Process

*   **`contextBridge` para Exposição Segura de APIs:**
    *   O `contextBridge` do Electron é a maneira mais segura de expor APIs do `Main Process` para o `Renderer Process`.
    *   No `preload.ts` (script que roda no contexto isolado do `Renderer` mas com acesso ao `Node.js`):
        *   Exponha funções específicas do `Main Process` (via `ipcRenderer.invoke` para chamadas bidirecionais e `ipcRenderer.send` para chamadas unidirecionais).
        *   Exponha um mecanismo para se inscrever em eventos do `Main Process` (via `ipcRenderer.on`).
    *   **Exemplo de `preload.ts`:**
        ```typescript
        // src/renderer/preload.ts
        import { contextBridge, ipcRenderer } from 'electron';
        import { IpcChannel } from '../shared/events/ipc-channels'; // Definições de canais IPC

        contextBridge.exposeInMainWorld('api', {
            // Chamadas bidirecionais (Renderer -> Main -> Renderer)
            invoke: <T>(channel: IpcChannel, ...args: any[]): Promise<T> => {
                if (Object.values(IpcChannel).includes(channel)) {
                    return ipcRenderer.invoke(channel, ...args);
                }
                throw new Error(`Unknown IPC channel: ${channel}`);
            },
            // Chamadas unidirecionais (Renderer -> Main)
            send: (channel: IpcChannel, ...args: any[]): void => {
                if (Object.values(IpcChannel).includes(channel)) {
                    ipcRenderer.send(channel, ...args);
                }
                throw new Error(`Unknown IPC channel: ${channel}`);
            },
            // Inscrição em eventos (Main -> Renderer)
            on: (channel: IpcChannel, listener: (...args: any[]) => void) => {
                if (Object.values(IpcChannel).includes(channel)) {
                    const subscription = (_event: Electron.IpcRendererEvent, ...args: any[]) => listener(...args);
                    ipcRenderer.on(channel, subscription);
                    return () => ipcRenderer.removeListener(channel, subscription);
                }
                throw new Error(`Unknown IPC channel: ${channel}`);
            },
            // Remover inscrição (Main -> Renderer)
            off: (channel: IpcChannel, listener: (...args: any[]) => void) => {
                if (Object.values(IpcChannel).includes(channel)) {
                    ipcRenderer.removeListener(channel, listener);
                }
                throw new Error(`Unknown IPC channel: ${channel}`);
            },
        });
        ```
    *   **No `Main Process` (`src/main/ipc/handlers/`):** Implemente os listeners para os canais IPC expostos.
        ```typescript
        // src/main/ipc/handlers/project.handler.ts
        import { ipcMain } from 'electron';
        import { IpcChannel } from '../../shared/events/ipc-channels';
        import { projectService } from '../../features/projects/project.service';
        import { CreateProjectSchema } from '../../shared/events/schemas/project.schemas'; // Ajustado o caminho

        ipcMain.handle(IpcChannel.CREATE_PROJECT, async (_event, data) => {
            try {
                const validatedData = CreateProjectSchema.parse(data); // Validação Zod
                const newProject = await projectService.createProject(validatedData);
                return { success: true, data: newProject };
            } catch (error) {
                console.error('Failed to create project:', error);
                return { success: false, error: error.message };
            }
        });
        ```
    *   **No `Renderer Process` (componente React):** Acesse a API exposta globalmente.
        ```typescript
        // src/renderer/features/projects/CreateProjectForm.tsx
        declare global {
            interface Window {
                api: {
                    invoke: <T>(channel: IpcChannel, ...args: any[]) => Promise<T>;
                    send: (channel: IpcChannel, ...args: any[]) => void;
                    on: (channel: IpcChannel, listener: (...args: any[]) => void) => () => void;
                    off: (channel: IpcChannel, listener: (...args: any[]) => void) => void;
                };
            }
        }

        const CreateProjectForm: React.FC = () => {
            const handleSubmit = async (values: any) => {
                const result = await window.api.invoke(IpcChannel.CREATE_PROJECT, values);
                if (result.success) {
                    console.log('Project created:', result.data);
                    // Atualizar UI, talvez via TanStack Query invalidation
                } else {
                    console.error('Error creating project:', result.error);
                }
            };
            // ... render form
        };
        ```

#### 5.1.2. Main Process <-> Worker Process(es)

*   **`MessagePort` (via `MessageChannel`) para Comunicação Bidirecional:**
    *   Para comunicação entre `Main` e `Worker`, `MessagePort` é mais robusto e flexível que `ipcMain/ipcRenderer` direto, pois permite a criação de canais de comunicação dedicados e tipados.
    *   O `Main Process` cria um `MessageChannel` e envia uma de suas `ports` para o `Worker Process` quando ele é inicializado.
    *   **No `Main Process` (`src/main/workers/manager.ts`):**
        ```typescript
        // Exemplo de inicialização de Worker
        import { Worker } from 'worker_threads';
        import { MessageChannel } from 'node:worker_threads';
        import path from 'node:path';
        import { IpcChannel } from '../../shared/events/ipc-channels';
        import { ipcMain } from 'electron'; // Importar ipcMain aqui

        const workerPath = path.join(__dirname, '../../worker/worker.js'); // Caminho compilado do worker
        const worker = new Worker(workerPath);

        const { port1, port2 } = new MessageChannel();

        worker.postMessage({ type: 'port', port: port2 }, [port2]); // Envia a porta para o worker

        port1.on('message', (message) => {
            // Lidar com mensagens do worker (status, resultados)
            console.log('Message from worker:', message);
            // Pode emitir eventos para o Renderer via ipcMain.send
            if (message.type === 'agent-progress') {
                ipcMain.send(IpcChannel.AGENT_PROGRESS, message.payload);
            }
        });

        // Enviar comandos para o worker
        port1.postMessage({ type: 'command', command: 'start-agent', payload: { agentId: 'abc' } });
        ```
    *   **No `Worker Process` (`src/worker/worker.ts`):**
        ```typescript
        // src/worker/worker.ts
        import { parentPort } from 'worker_threads';
        import { IpcChannel } from '../shared/events/ipc-channels';

        let mainPort: MessagePort | null = null;

        if (parentPort) {
            parentPort.on('message', (message) => {
                if (message.type === 'port') {
                    mainPort = message.port; // Recebe a porta do Main Process
                    mainPort.on('message', (command) => {
                        // Lidar com comandos do Main Process
                        console.log('Command from main:', command);
                        if (command.type === 'command' && command.command === 'start-agent') {
                            // Lógica para iniciar agente
                            mainPort?.postMessage({ type: 'agent-status', status: 'running', agentId: command.payload.agentId });
                        }
                    });
                }
            });
        }

        // Exemplo de como o worker envia progresso de volta para o Main
        export const sendProgressToMain = (progressData: any) => {
            if (mainPort) {
                mainPort.postMessage({ type: 'agent-progress', payload: progressData });
            }
        };
        ```

### 5.2. Definição de Canais IPC (`src/shared/events/ipc-channels.ts`)

Todos os canais IPC devem ser definidos em um enum ou objeto compartilhado para garantir consistência e evitar erros de digitação.

```typescript
// src/shared/events/ipc-channels.ts
export enum IpcChannel {
    // Renderer -> Main
    CREATE_PROJECT = 'create-project',
    GET_PROJECT_DETAILS = 'get-project-details',
    SEND_MESSAGE_TO_AGENT = 'send-message-to-agent',
    // Main -> Renderer
    PROJECT_CREATED = 'project-created',
    AGENT_MESSAGE_RECEIVED = 'agent-message-received',
    AGENT_PROGRESS = 'agent-progress',
    // Main -> Worker
    START_AGENT_TASK = 'start-agent-task',
    CANCEL_AGENT_TASK = 'cancel-agent-task',
    // Worker -> Main
    AGENT_TASK_COMPLETED = 'agent-task-completed',
    AGENT_TASK_PROGRESS = 'agent-task-progress',
    AGENT_LOG = 'agent-log',
}
```

### 5.3. Exemplos de Fluxos de Comunicação

#### Exemplo 1: Mensagem do Usuário na UI para o Worker

**Cenário:** O usuário digita "Crie um componente de login" no chat da UI.

1.  **UI (Renderer):** O componente de chat captura a entrada do usuário.
    *   `window.api.invoke(IpcChannel.SEND_MESSAGE_TO_AGENT, { projectId: 'xyz', agentId: 'abc', message: 'Crie um componente de login' });`
2.  **Main Process:** O handler `SEND_MESSAGE_TO_AGENT` (em `src/main/ipc/handlers/chat.handler.ts`) recebe a mensagem.
    *   Valida o payload (Zod).
    *   Persiste a mensagem no banco de dados (via `chatService`).
    *   Identifica o `Worker Process` responsável pelo agente `abc`.
    *   Envia um comando para o `Worker Process` via `MessagePort`:
        *   `workerPort.postMessage({ type: 'command', command: IpcChannel.START_AGENT_TASK, payload: { taskId: 'task-123', agentId: 'abc', prompt: 'Crie um componente de login' } });`
3.  **Worker Process:** O `worker.ts` recebe o comando `START_AGENT_TASK`.
    *   O `AgentManager` (em `src/worker/agents/manager.ts`) delega a tarefa ao `Agent` `abc`.
    *   O `Agent` `abc` começa a processar a solicitação (interage com LLM, usa ferramentas, etc.).

#### Exemplo 2: Status do Progresso do Agente de Volta para o Dashboard na UI

**Cenário:** O agente está gerando código e envia atualizações de progresso.

1.  **Worker Process:** O `Agent` `abc` (em `src/worker/agents/frontend-dev/`) gera um log de progresso.
    *   `sendProgressToMain({ taskId: 'task-123', status: 'generating-code', progress: 50 });` (função utilitária que usa `mainPort.postMessage`)
2.  **Main Process:** O `port1.on('message')` no `src/main/workers/manager.ts` recebe a mensagem do worker.
    *   Processa a mensagem (ex: persiste o log no DB).
    *   Emite um evento para o `Renderer Process`:
        *   `ipcMain.send(IpcChannel.AGENT_PROGRESS, { taskId: 'task-123', status: 'generating-code', progress: 50 });`
3.  **UI (Renderer):** O componente de Dashboard (em `src/renderer/features/dashboard/`) ou o componente de chat se inscreve no evento `AGENT_PROGRESS`.
    *   `window.api.on(IpcChannel.AGENT_PROGRESS, (data) => { /* Atualiza o estado da UI com o progresso */ });`
    *   O `TanStack Query` pode ser usado para invalidar queries relacionadas ao status da tarefa, forçando uma re-busca e atualização da UI.

Este sistema de IPC, com `contextBridge` para segurança e `MessagePort` para robustez entre `Main` e `Worker`, juntamente com canais IPC bem definidos e validação Zod, garante uma comunicação clara, segura e eficiente em toda a aplicação.

---

## 6. Arquitetura dos Agentes de IA (no Worker)

A arquitetura dos agentes de IA é o coração do Project Wiz, onde a inteligência e a autonomia se manifestam. No `Worker Process`, a estrutura deve ser modular, extensível e fácil de entender para permitir a adição de novos especialistas sem refatorar o núcleo do sistema.

### 6.1. Interface/Classe Base `Agent`

Todos os agentes devem aderir a um contrato comum, definido por uma interface ou classe base. Isso garante que o `AgentManager` possa interagir com qualquer tipo de agente de forma polimórfica.

```typescript
// src/worker/agents/base/IAgent.ts
import { AgentConfig } from './AgentConfig';
import { AgentTask, AgentTaskResult, AgentProgress } from '../../types/agent-types';
import { ITool } from '../../tools/base/ITool';

export interface IAgent {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly config: AgentConfig;

    // Inicializa o agente com suas ferramentas e configurações
    initialize(tools: ITool[], config: AgentConfig): Promise<void>;

    // Processa uma tarefa delegada
    processTask(task: AgentTask): Promise<AgentTaskResult>;

    // Opcional: Lidar com interrupções ou cancelamentos
    cancelTask?(taskId: string): Promise<void>;

    // Opcional: Emitir progresso (via callback ou EventEmitter interno)
    onProgress?(callback: (progress: AgentProgress) => void): void;
}

// src/worker/agents/base/BaseAgent.ts (Classe abstrata para implementação comum)
import { EventEmitter } from 'node:events';

export abstract class BaseAgent extends EventEmitter implements IAgent {
    public readonly id: string;
    public readonly name: string;
    public readonly description: string;
    public config: AgentConfig;
    protected tools: ITool[] = [];

    constructor(id: string, name: string, description: string, config: AgentConfig) {
        super();
        this.id = id;
        this.name = name;
        this.description = description;
        this.config = config;
    }

    async initialize(tools: ITool[], config: AgentConfig): Promise<void> {
        this.tools = tools;
        this.config = { ...this.config, ...config };
        // Lógica de inicialização específica do agente
    }

    abstract processTask(task: AgentTask): Promise<AgentTaskResult>;

    protected emitProgress(progress: AgentProgress): void {
        this.emit('progress', progress);
    }
}
```

### 6.2. Estrutura de um Agente Individual

Cada agente especialista (ex: `FrontendDevAgent`, `CodeAnalystAgent`) terá sua própria pasta em `src/worker/agents/` e seguirá uma estrutura interna consistente:

```
src/worker/agents/
├───frontend-dev/
│   ├───FrontendDevAgent.ts      # Implementação principal do agente
│   ├───FrontendDevConfig.ts     # Configurações específicas do agente
│   ├───prompts/                 # Prompts específicos do agente (templates)
│   ├───tools/                   # Ferramentas específicas que este agente pode usar (se não forem genéricas)
│   ├───strategies/              # Estratégias internas para diferentes tipos de tarefas
│   └───...
├───code-analyst/
│   ├───CodeAnalystAgent.ts
│   ├───CodeAnalystConfig.ts
│   ├───prompts/
│   └───...
└───...
```

### 6.3. Gerenciamento e Contratação Dinâmica de Agentes (`AgentManager`)

O `AgentManager` (em `src/worker/agents/manager.ts`) será responsável por registrar, instanciar e gerenciar o ciclo de vida dos agentes.

*   **Registro de Agentes:** Agentes podem ser registrados no `AgentManager` no início do `Worker Process`.
    ```typescript
    // src/worker/agents/manager.ts
    import { IAgent } from './base/IAgent';
    import { BaseAgent } from './base/BaseAgent';
    import { FrontendDevAgent } from '../frontend-dev/FrontendDevAgent';
    import { CodeAnalystAgent } from '../code-analyst/CodeAnalystAgent';
    import { ITool } from '../tools/base/ITool';
    import { FileSystemTool } from '../tools/file-system/FileSystemTool';
    import { GitTool } from '../tools/git/GitTool';
    import { sendProgressToMain } from '../worker'; // Importar a função de comunicação

    type AgentConstructor = new (id: string, name: string, description: string, config: any) => BaseAgent;

    class AgentManager {
        private registeredAgents: Map<string, AgentConstructor> = new Map();
        private activeAgents: Map<string, IAgent> = new Map(); // Instâncias ativas
        private availableTools: ITool[] = [];

        constructor() {
            this.registerAgentType('frontend-dev', FrontendDevAgent);
            this.registerAgentType('code-analyst', CodeAnalystAgent);
            // Registrar outras ferramentas disponíveis globalmente
            this.availableTools.push(new FileSystemTool());
            this.availableTools.push(new GitTool());
        }

        private registerAgentType(type: string, constructor: AgentConstructor) {
            this.registeredAgents.set(type, constructor);
        }

        // Chamado pelo Main Process para "contratar" um agente
        public async hireAgent(agentId: string, agentType: string, name: string, description: string, config: any): Promise<IAgent> {
            if (this.activeAgents.has(agentId)) {
                return this.activeAgents.get(agentId)!;
            }

            const AgentClass = this.registeredAgents.get(agentType);
            if (!AgentClass) {
                throw new Error(`Agent type ${agentType} not registered.`);
            }

            const newAgent = new AgentClass(agentId, name, description, config);
            await newAgent.initialize(this.availableTools, config); // Inicializa com ferramentas e config

            // Encaminhar eventos de progresso do agente para o Main Process
            newAgent.on('progress', (progress) => {
                sendProgressToMain({ agentId: newAgent.id, ...progress });
            });

            this.activeAgents.set(agentId, newAgent);
            return newAgent;
        }

        public getAgent(agentId: string): IAgent | undefined {
            return this.activeAgents.get(agentId);
        }

        public async processAgentTask(agentId: string, task: AgentTask): Promise<AgentTaskResult> {
            const agent = this.getAgent(agentId);
            if (!agent) {
                throw new Error(`Agent ${agentId} not found or not active.`);
            }
            return agent.processTask(task);
        }

        // ... métodos para demitir agentes, listar ativos, etc.
    }

    export const agentManager = new AgentManager();
    ```
*   **Contratação (Hiring):** O `Main Process` enviará um comando para o `Worker Process` (via `MessagePort`) para "contratar" um agente, passando seu `id`, `type` (ex: 'frontend-dev'), `name`, `description` e `config`. O `AgentManager` instanciará o agente apropriado e o inicializará com as ferramentas disponíveis.

### 6.4. Comunicação entre Agentes (Fóruns de IA)

A comunicação entre agentes é um aspecto crucial para a colaboração em tarefas complexas. Isso será implementado através de um sistema de "Fóruns de IA" que utiliza o `Event Bus` interno do `Worker Process` e, para persistência e contexto, o banco de dados.

*   **Conceito:** Um "Fórum" é essencialmente um tópico de discussão persistente no banco de dados (tabela `conversations` ou `forum_topics`). Agentes podem "participar" de um fórum, postar mensagens e ler o histórico.
*   **Mecanismo:**
    1.  **Publicação de Mensagens:** Quando um agente precisa de ajuda ou quer compartilhar uma descoberta, ele "posta uma mensagem" no fórum relevante. Essa "mensagem" é um evento interno (`ForumMessagePostedEvent`) que contém o `agentId` do remetente, o `forumId` e o `content`.
    2.  **Persistência:** O `ForumService` (em `src/worker/features/forum/`) escuta esses eventos, persiste a mensagem no banco de dados e, opcionalmente, a envia para o `Main Process` para exibição na UI.
    3.  **Escuta de Mensagens:** Outros agentes interessados no `forumId` podem "escutar" por novas mensagens. Isso pode ser feito de duas formas:
        *   **Polling:** Agentes periodicamente consultam o `ForumService` para novas mensagens no fórum.
        *   **Eventos Internos:** O `ForumService` pode emitir um evento interno (`NewForumMessageEvent`) para agentes que se registraram como "ouvintes" para um fórum específico. Isso é mais reativo.
*   **Exemplo de Fluxo (Simplificado):**
    *   `FrontendDevAgent` encontra um problema de compatibilidade de navegador.
    *   Ele "posta" uma mensagem no fórum "Bug Fixing" (`forumService.postMessage(forumId, this.id, 'Problema de compatibilidade com Safari...')`).
    *   O `BugFixingAgent` (ou um agente genérico que monitora fóruns de bugs) recebe a mensagem (via polling ou evento).
    *   O `BugFixingAgent` processa a mensagem, talvez fazendo perguntas de volta ou propondo uma solução.
*   **Contexto e Memória:** O histórico do fórum serve como a memória de curto e médio prazo para a colaboração entre agentes. Agentes podem "ler" o histórico do fórum para entender o contexto completo da discussão.

Esta arquitetura de agentes, combinando uma interface comum, gerenciamento centralizado e um sistema de comunicação baseado em fóruns, permite que o Project Wiz escale em complexidade e inteligência, facilitando a criação e orquestração de equipes de IA altamente especializadas.