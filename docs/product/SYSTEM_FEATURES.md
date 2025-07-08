# Documento de Requisitos de Produto e Visão Técnica: Project Wiz v0.9

**Versão:** 2.0
**Status:** Completo e Detalhado
**Propósito:** Este documento é a fonte canônica da verdade para o escopo, funcionalidade e arquitetura da versão 0.9 do Project Wiz. Ele é projetado para ser detalhado o suficiente para que uma equipe de desenvolvimento possa entender a visão do produto e implementar o sistema de forma consistente.

---

## 1. Visão Geral e Experiência do Usuário

O Project Wiz é uma plataforma de automação de engenharia de software que funciona como um **time de desenvolvimento de IA autônomo**. A filosofia central do sistema é abstrair a complexidade do desenvolvimento de software do usuário, permitindo que ele gerencie projetos de alto nível através de conversas e delegação de intenções, em vez de comandos diretos e gerenciamento de tarefas.

### 1.1. A Metáfora: O Gerente e sua Equipe de IA

A interface e a experiência do usuário são projetadas em torno de uma metáfora simples e poderosa: o usuário é um **Gerente de Produto ou Tech Lead**, e o Project Wiz fornece a ele uma **equipe de especialistas de IA (Personas)** para executar o trabalho.

- **A Interface Estilo Discord:** A tela principal se assemelha ao Discord. Na barra lateral esquerda, o usuário vê seus **Projetos**, que são análogos aos "Servidores". Acima dos projetos, há um ícone para as **Mensagens Diretas**, a área pessoal do usuário para conversas fora do contexto de um projeto.

- **Interação Conversacional:** A principal forma de interação do usuário com o sistema é através do chat. Em vez de preencher formulários para criar tarefas, o usuário simplesmente expressa uma necessidade em linguagem natural, como faria com um colega de equipe: "Pessoal, precisamos implementar a autenticação de dois fatores" ou "Lucas, você pode investigar por que os testes de API estão lentos?".

- **Autonomia do Sistema:** O "trabalho pesado" acontece nos bastidores. O sistema analisa a conversa, entende a intenção, cria uma ou mais tarefas (Jobs), atribui-as ao especialista de IA (Persona) mais qualificado da equipe e gerencia todo o ciclo de vida da execução, incluindo o versionamento de código com Git. O usuário não precisa saber como o Git funciona ou como as tarefas são divididas; ele apenas vê o resultado final.

### 1.2. Fluxo de Trabalho Principal do Usuário

1.  **Criação do Projeto:** O usuário inicia criando um "Projeto", que é um workspace auto-contido. Ele pode começar do zero ou fornecer uma URL do GitHub para que o sistema clone um repositório existente.

2.  **Formação da Equipe (Contratação de Personas):** Para cada projeto, o usuário tem uma "equipe" de Personas. O sistema pode, de forma autônoma, analisar o código e "contratar" especialistas relevantes (ex: "Contratei uma especialista em React, pois vi que seu projeto usa Next.js"). O usuário também pode criar Personas personalizadas através de um wizard assistido, definindo suas especialidades e personalidades (ex: "Lucas, Desenvolvedor Fullstack Sênior").

3.  **Delegação de Intenções:** O usuário vai para o canal de chat do projeto e descreve uma necessidade. O sistema interpreta, planeja e atribui o trabalho.

4.  **Colaboração Estruturada:** Para discussões complexas, o sistema ou o usuário pode criar um tópico no **Fórum** do projeto, permitindo que múltiplas Personas colaborem de forma organizada.

5.  **Monitoramento e Feedback:** O usuário pode acompanhar o progresso em um painel de atividades e conversar com as Personas para tirar dúvidas ou dar feedback. Sua intervenção direta (como pausar um Job) é uma ação de exceção, não a norma.

---

## 2. Funcionalidades Detalhadas do Usuário Final

### Módulo 1: Espaço Pessoal e Mensagens Diretas

**Visão:** Um hub central para o usuário, independente de projetos, para conversas privadas e gerenciamento de configurações globais.

- **1.1. Mensagens Diretas (DMs):**
  - **Descrição:** Permite que o usuário tenha conversas 1-para-1 com qualquer Persona de qualquer projeto, ou com o assistente geral do sistema, o "WizBot".
  - **Fluxo do Usuário:** O usuário clica no ícone de "Home" no topo da barra de servidores. A tela principal exibe uma lista de conversas recentes. Clicar em uma conversa abre o histórico de chat. Uma nova conversa pode ser iniciada procurando por uma Persona pelo nome.
  - **Requisitos Técnicos:** Requer uma tabela no banco de dados para `DirectMessages`. As DMs com Personas disparam o `Runtime do Agente` correspondente para gerar uma resposta.

- **1.2. Configurações Globais:**
  - **Descrição:** Uma área onde o usuário gerencia configurações que se aplicam a toda a aplicação.
  - **Fluxo do Usuário:** Acessível através de um ícone de engrenagem perto do nome do usuário. A tela é dividida em seções: "Minha Conta", "Aparência", "Notificações", "Chaves de API".
  - **Requisitos Técnicos:** As configurações são persistidas em uma tabela `UserSettings`. A seção "Chaves de API" deve usar criptografia a nível de sistema operacional (ex: `electron-store` com criptografia ou chaveiro do SO) para armazenar tokens de forma segura.

### Módulo 2: Gerenciamento de Projetos

**Visão:** Tratar cada projeto como um workspace vivo e independente, com sua própria equipe e base de código.

- **2.1. Criar e Gerenciar Projetos:**
  - **Descrição:** O fluxo completo para criar, listar e remover workspaces de projeto.
  - **Fluxo do Usuário (Criação):** O usuário clica no botão "+" na barra de servidores. Um modal aparece, pedindo "Nome do Projeto" e um campo opcional "URL do Repositório GitHub". Ao clicar em "Criar", uma tela de progresso é exibida enquanto o sistema provisiona o projeto. Ao concluir, o usuário é redirecionado para o novo projeto.
  - **Requisitos Técnicos:** Dispara um `CreateProjectCommand`. O handler do comando orquestra o `Git Service` para clonar ou inicializar o repositório em um diretório gerenciado internamente. Em caso de falha (URL inválida, falha de clone), o usuário recebe uma notificação de erro clara.

- **2.2. Configurações do Projeto:**
  - **Descrição:** Painel de configurações específico para cada projeto.
  - **Fluxo do Usuário:** Dentro de um projeto, o usuário clica no nome do projeto no topo para abrir um menu, onde seleciona "Configurações do Projeto".
  - **Contratação Automática:** Um toggle switch proeminente permite ao usuário controlar se o sistema pode ou não adicionar novas Personas à equipe do projeto de forma autônoma. Esta configuração é por projeto.

### Módulo 3: Gerenciamento de Personas (A Equipe de IA)

**Visão:** Transformar a configuração de agentes de IA em um processo intuitivo de "formação de equipe", com especialistas que podem ser criados manualmente ou contratados autonomamente pelo sistema.

- **3.1. Contratação de Personas:**
  - **Automática:**
    - **Descrição:** O sistema analisa a base de código de um projeto e, se a "contratação automática" estiver habilitada, cria e configura Personas otimizadas para a stack tecnológica encontrada.
    - **Fluxo do Usuário:** A interação é passiva. O usuário recebe uma notificação no chat do projeto: "Olá! Analisei seu projeto e notei que você está usando Django e PostgreSQL. Para te ajudar, contratei a *Sofia, Engenheira de Backend Python*, especialista em Django. Você pode conversar com ela ou ver o perfil dela na aba da equipe."
    - **Requisitos Técnicos:** Disparado por um evento `ProjectCreated` ou por uma ação manual. Utiliza o `CodeAnalysisService` para identificar a stack. Usa um `MetaPrompt` para gerar uma configuração de Persona (prompt, ferramentas, nome, avatar) e a salva no banco de dados.
  - **Manual (Wizard Assistido):**
    - **Descrição:** Um fluxo guiado para criar uma Persona customizada.
    - **Fluxo do Usuário:** O usuário clica em "Contratar Novo Membro" na tela da equipe. Um wizard passo a passo é iniciado. O assistente de IA (WizBot) conversa com o usuário para definir a especialidade, o nível de senioridade, as ferramentas e até a personalidade do novo membro.
    - **Requisitos Técnicos:** A conversa com o wizard utiliza o `LlmService` com um `MetaPrompt` de configuração para traduzir a linguagem natural do usuário em um objeto de configuração de Persona.

- **3.2. Gerenciar a Equipe:**
  - **Descrição:** Uma visão central para ver, editar e remover os membros da equipe de IA de um projeto.
  - **Fluxo do Usuário:** Uma aba "Equipe" dentro do projeto exibe cartões para cada Persona, mostrando seu nome, avatar e especialidade. Clicar em um cartão abre uma visão detalhada para edição ou exclusão ("demissão").

### Módulo 4: Fórum de Discussão do Projeto

**Visão:** Um espaço para colaboração estruturada e assíncrona, criando uma base de conhecimento persistente para as decisões e investigações do projeto.

- **4.1. Criar e Visualizar Tópicos:**
  - **Descrição:** Permite que o usuário ou as Personas iniciem discussões focadas.
  - **Fluxo do Usuário:** Dentro de um projeto, há uma aba "Fórum". A tela principal mostra uma lista de tópicos com título, autor e data da última atividade. O usuário pode clicar em "Novo Tópico" para criar um.
  - **Requisitos Técnicos:** Requer tabelas `ForumTopics` e `ForumPosts`. A criação de um tópico dispara um `CreateTopicCommand`.

- **4.2. Participar de Discussões:**
  - **Descrição:** O fluxo de conversa dentro de um tópico.
  - **Fluxo do Usuário:** Ao entrar em um tópico, o usuário vê uma thread de mensagens. Ele pode escrever uma nova mensagem na parte inferior. As Personas podem postar autonomamente no tópico como parte da execução de um Job ou em resposta a outras mensagens.
  - **Requisitos Técnicos:** O `Orquestrador de Intenção` pode direcionar Personas para colaborar em um tópico específico. As respostas são salvas como `ForumPosts`.

### Módulo 5: Interação e Fluxo de Trabalho

**Visão:** O centro de comando conversacional do projeto, onde o trabalho é iniciado de forma natural e o progresso é monitorado de forma passiva.

- **5.1. Iniciar Tarefas via Chat:**
  - **Descrição:** O ponto de partida para qualquer trabalho no projeto.
  - **Fluxo do Usuário:** O usuário digita uma necessidade no chat principal do projeto. Não há um comando especial. Ele simplesmente escreve. Ex: "O login está quebrando em emails com um `+`, precisamos corrigir isso."
  - **Requisitos Técnicos:** Esta é a funcionalidade mais complexa. Cada mensagem dispara uma chamada para o `Orquestrador de Intenção`, que a analisa. Se a intenção for uma tarefa, o orquestrador a transforma em um Job e a roteia para a fila do Agente mais apropriado.

- **5.2. Visualizar o Fluxo de Atividades (Jobs):**
  - **Descrição:** Um painel de visualização para dar ao usuário uma noção do que sua equipe de IA está fazendo.
  - **Fluxo do Usuário:** Uma aba "Atividades" no projeto exibe colunas (Na Fila, Em Execução, Concluído, Falhou). Os Jobs são representados como cartões que se movem entre as colunas em tempo real.
  - **Requisitos Técnicos:** A UI escuta por eventos (`JobCreated`, `JobStarted`, `JobCompleted`, etc.) emitidos pelo `EventBus` para atualizar a visualização em tempo real.

---

## 3. Funcionalidades Detalhadas de Suporte Técnico

### Sistema 1-3: (Kernel, Persistência, IPC)
- **Descrição:** A espinha dorsal da aplicação, provendo o dispatcher CQRS, o barramento de eventos, a camada de acesso a dados com Drizzle (incluindo tabelas para Projetos, Personas, Jobs, Mensagens, Tópicos e Posts) e a ponte de comunicação segura com o frontend.

### Sistema 4: Sistema de Filas por Agente
- **Descrição:** Cada Agente ativo possui sua própria fila de Jobs dedicada, implementada usando uma tabela no banco de dados com um status e um `agent_id`. Isso garante isolamento e processamento sequencial das tarefas para cada especialista.

### Sistema 5-6: (Integração com LLMs, Interação com Filesystem)
- **Descrição:** Camadas de abstração para interagir com LLMs externos e com o sistema de arquivos local de forma segura, dentro dos limites do diretório de um projeto.

### Sistema 7: Integração com Git (Automatizada)
- **Descrição:** Um serviço interno (`GitService`) que abstrai as operações do Git. Ele é chamado pelo `Runtime do Agente` no início e no fim de um Job para executar `pull`, `add`, `commit` e `push`. As mensagens de commit são geradas por uma chamada de LLM baseada no trabalho realizado.

### Sistema 8: Análise de Código Estático
- **Descrição:** Um serviço (`CodeAnalysisService`) que pode ler arquivos de manifesto (`package.json`, etc.) para extrair dependências e inferir a stack tecnológica, alimentando a lógica de "contratação automática" de Personas.

### Sistema 9: Runtime do Agente (Conceito Interno)
- **Descrição:** Um Agente é um processo `worker_thread` persistente. Quando uma Persona é contratada, um novo processo de Agente é iniciado. Ele carrega a configuração da Persona e entra em um loop infinito, verificando sua fila de Jobs dedicada no banco de dados. Ao encontrar um novo Job, ele o executa. O processo só é encerrado quando a Persona é "demitida".

### Sistema 10: Orquestrador de Intenção e Jobs
- **Descrição:** O cérebro do sistema. Ele recebe as mensagens do chat e usa o `LlmService` para: 1. Classificar a intenção. 2. Se for uma tarefa, extrair os requisitos. 3. Chamar o `PersonaService` para encontrar a Persona mais qualificada (comparando os requisitos da tarefa com as especialidades das Personas). 4. Criar um `Job` no banco de dados. 5. Colocar o ID do Job na fila específica do Agente escolhido.
