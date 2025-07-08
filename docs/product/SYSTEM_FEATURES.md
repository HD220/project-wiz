# Catálogo de Funcionalidades: Project Wiz v0.9

**Versão:** 1.7
**Status:** Final
**Propósito:** Este documento serve como a fonte única da verdade para o escopo funcional da versão 0.9 do Project Wiz. Ele detalha todas as funcionalidades visíveis para o usuário final e as capacidades técnicas de suporte necessárias para implementá-las.

---

## Parte 1: Funcionalidades do Usuário Final

Esta seção descreve o que um usuário pode fazer com a aplicação. A interação é primariamente conversacional.

### Módulo 1: Gerenciamento de Projetos

Um "Projeto" é um workspace auto-contido dentro do Project Wiz, similar a um servidor no Discord.

- **1.1. Criar um Novo Projeto:**
  - O usuário pode criar um novo projeto, fornecendo um nome e, opcionalmente, uma URL de um repositório GitHub para clonar.

- **1.2. Listar Projetos:**
  - O usuário vê uma barra lateral com a lista de todos os seus projetos.

- **1.3. Configurações do Projeto:**
  - Dentro de um projeto, o usuário pode acessar uma área de configurações.
  - **Contratação Automática:** O usuário pode habilitar ou desabilitar a opção "Permitir a contratação automática de novas Personas para este projeto".

- **1.4. Remover um Projeto:**
  - O usuário pode remover um projeto do Project Wiz.

### Módulo 2: Gerenciamento de Personas (A Equipe de IA)

Uma "Persona" é um especialista de IA com nome, personalidade e um conjunto de habilidades. Elas são os membros da equipe do projeto.

- **2.1. Contratação de Personas:**
  - **Automática:** Se permitido, o sistema analisa o código e, proativamente, "contrata" (cria) novas Personas para a equipe, notificando o usuário sobre o novo membro.
  - **Manual (Wizard Assistido):** O usuário pode optar por criar uma Persona manualmente através de um wizard, onde ele descreve a intenção e um assistente de IA ajuda a refinar a configuração.

- **2.2. Visualizar a Equipe do Projeto:**
  - O usuário pode ver a lista de todas as Personas (a "equipe") disponíveis para um projeto.

- **2.3. Gerenciar Personas:**
  - O usuário pode editar ou "demitir" (excluir) uma Persona da sua equipe.

### Módulo 3: Interação e Fluxo de Trabalho

O trabalho é iniciado e monitorado através de uma interface conversacional e painéis de visualização.

- **3.1. Iniciar Tarefas via Chat:**
  - O usuário expressa uma necessidade em linguagem natural no canal de chat de um projeto (ex: "Precisamos de testes para o serviço de autenticação") ou em uma conversa direta com uma Persona.
  - O sistema interpreta essa mensagem, cria um Job formal internamente e o atribui à Persona mais adequada.

- **3.2. Chat para Dúvidas e Esclarecimentos:**
  - O usuário pode conversar com as Personas para fazer perguntas sobre o código ou o andamento do trabalho.

- **3.3. Visualizar o Fluxo de Atividades (Jobs):**
  - O usuário tem acesso a um painel que mostra o status de todos os Jobs do projeto: `Na Fila`, `Em Execução`, `Concluído`, `Falhou`.
  - Esta visão é para **monitoramento**, não para gerenciamento ativo.

- **3.4. Intervenção em Casos de Exceção:**
  - Se um Job parece estar travado ou com problemas, o usuário pode, a partir do painel de atividades, pausar ou cancelar a execução.

---

## Parte 2: Funcionalidades de Suporte Técnico

Esta seção descreve as capacidades internas do sistema.

### Sistema 1: Kernel da Aplicação (AMA Core)
- **1.1. CQRS Dispatcher:** Um dispatcher central para Comandos e Queries.
- **1.2. Event Bus:** Um barramento de eventos para comunicação assíncrona.

### Sistema 2: Persistência de Dados
- **2.1. Banco de Dados SQLite e Drizzle ORM:** Para armazenamento e acesso a metadados.

### Sistema 3: Comunicação Inter-Processos (IPC)
- **3.1. Ponte Segura e Contrato Type-Safe:** Para comunicação segura entre backend e frontend.

### Sistema 4: Sistema de Filas por Agente
- **4.1. Filas de Jobs Dedicadas:** Cada Agente ativo possui sua própria fila de Jobs dedicada e persistente no banco de dados. Isso garante que as tarefas atribuídas a um especialista sejam executadas por ele, em ordem.

### Sistema 5: Integração com LLMs
- **5.1. Adaptador de LLM e Gerenciamento de Prompts:** Camada de abstração para comunicação com LLMs e gerenciamento de templates de prompts.

### Sistema 6: Interação com o Sistema de Arquivos
- **6.1. Ferramentas de Filesystem Seguras:** Ferramentas para os Agentes interagirem com o sistema de arquivos do projeto.

### Sistema 7: Integração com Git (Automatizada)
- **7.1. Ciclo de Vida Git Automatizado:** O sistema gerencia `pull`, `commit` e `push` como parte da execução de um Job.
- **7.2. Provisionamento e Credenciais:** O sistema lida com `git clone`, `git init` e o gerenciamento seguro de credenciais.

### Sistema 8: Análise de Código Estático
- **8.1. Análise de Stack Tecnológica:** Para suportar a contratação automática de Personas.

### Sistema 9: Runtime do Agente (Conceito Interno)
- **9.1. Processo de Agente Persistente:** Um "Agente" é um processo de longa duração (long-running process), provavelmente em uma `worker_thread`, que é iniciado quando uma Persona é "contratada" para um projeto.
- **9.2. Carregamento de Configuração:** Ao iniciar, o Agente carrega a configuração da sua Persona correspondente (prompt do sistema, ferramentas, etc.) para definir seu comportamento.
- **9.3. Ciclo de Vida:** O Agente permanece ativo indefinidamente, monitorando sua fila de Jobs dedicada. Ele só é encerrado quando a Persona correspondente é "demitida" pelo usuário.

### Sistema 10: Orquestrador de Intenção e Jobs
- **10.1. Análise de Intenção e Roteamento:** O sistema analisa a conversa do usuário, classifica a intenção e, se for uma tarefa, a roteia para a Persona mais qualificada.
- **10.2. Enfileiramento Direcionado:** Ao criar o Job, o orquestrador o coloca na **fila específica** pertencente ao Agente da Persona selecionada.