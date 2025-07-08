# Documento de Visão de Produto e Requisitos: Project Wiz v0.9

**Versão:** 2.1
**Status:** Final
**Propósito:** Este documento é a fonte canônica da verdade para a visão, experiência do usuário e escopo funcional da versão 0.9 do Project Wiz. Ele é projetado para ser um guia conceitual robusto para as equipes de produto, design e engenharia.

---

## 1. Visão Geral e Experiência do Usuário

O Project Wiz é uma plataforma de automação de engenharia de software que funciona como um **time de desenvolvimento de IA autônomo**. A filosofia central do sistema é abstrair a complexidade do desenvolvimento de software do usuário, permitindo que ele gerencie projetos de alto nível através de conversas e delegação de intenções, em vez de comandos diretos e gerenciamento de tarefas.

### 1.1. A Metáfora: O Gerente e sua Equipe de IA

A interface e a experiência do usuário são projetadas em torno de uma metáfora simples e poderosa: o usuário é um **Gerente de Produto ou Tech Lead**, e o Project Wiz fornece a ele uma **equipe de especialistas de IA (Personas)** para executar o trabalho.

- **A Interface Estilo Colaborativo:** A tela principal se assemelha a uma ferramenta de colaboração moderna como o Discord ou o Slack. Na barra lateral esquerda, o usuário vê seus **Projetos**, que são análogos aos "Servidores" ou "Workspaces". Acima dos projetos, há um ícone para as **Mensagens Diretas**, a área pessoal do usuário para conversas fora do contexto de um projeto.

- **Interação Conversacional:** A principal forma de interação do usuário com o sistema é através do chat. Em vez de preencher formulários para criar tarefas, o usuário simplesmente expressa uma necessidade em linguagem natural, como faria com um colega de equipe: "Pessoal, precisamos implementar a autenticação de dois fatores" ou "Lucas, você pode investigar por que os testes de API estão lentos?".

- **Autonomia do Sistema:** O "trabalho pesado" acontece nos bastidores. O sistema analisa a conversa, entende a intenção, cria uma ou mais tarefas (Jobs), atribui-as ao especialista de IA (Persona) mais qualificado da equipe e gerencia todo o ciclo de vida da execução, incluindo o versionamento de código. O usuário não precisa saber como o Git funciona ou como as tarefas são divididas; ele apenas vê o resultado final.

### 1.2. Fluxo de Trabalho Principal do Usuário

1.  **Criação do Projeto:** O usuário inicia criando um "Projeto", que é um workspace auto-contido.
2.  **Formação da Equipe (Contratação de Personas):** Para cada projeto, o usuário tem uma "equipe" de Personas. O sistema pode, de forma autônoma, analisar o código e "contratar" especialistas relevantes.
3.  **Delegação de Intenções:** O usuário vai para o canal de chat do projeto e descreve uma necessidade. O sistema interpreta, planeja e atribui o trabalho.
4.  **Colaboração Estruturada:** Para discussões complexas, o sistema ou o usuário pode criar um tópico no **Fórum** do projeto, permitindo que múltiplas Personas colaborem de forma organizada.
5.  **Monitoramento e Feedback:** O usuário pode acompanhar o progresso em um painel de atividades e conversar com as Personas para tirar dúvidas ou dar feedback.

---

## 2. Funcionalidades Conceituais do Usuário Final

### Módulo 1: Espaço Pessoal e Mensagens Diretas

**Visão:** Um hub central para o usuário, independente de projetos, para conversas privadas e gerenciamento de configurações globais.

- **1.1. Mensagens Diretas (DMs):** Permite que o usuário tenha conversas 1-para-1 com qualquer Persona ou com o assistente geral do sistema.
- **1.2. Configurações Globais:** Uma área onde o usuário gerencia configurações da sua conta, como tema, notificações e chaves de API para serviços externos, que devem ser armazenadas de forma segura.

### Módulo 2: Gerenciamento de Projetos

**Visão:** Tratar cada projeto como um workspace vivo e independente, com sua própria equipe e base de código.

- **2.1. Ciclo de Vida do Projeto:** O usuário pode criar, listar e remover workspaces de projeto. A criação pode ser a partir do zero (resultando em um repositório novo) ou a partir de um repositório Git existente (clonado de uma URL).
- **2.2. Configurações do Projeto:** Um painel de configurações específico para cada projeto, onde o usuário pode controlar, por exemplo, a "contratação automática" de Personas.

### Módulo 3: Gerenciamento de Personas (A Equipe de IA)

**Visão:** Transformar a configuração de agentes de IA em um processo intuitivo de "formação de equipe", com especialistas que podem ser criados manualmente ou contratados autonomamente pelo sistema.

- **3.1. Contratação de Personas:**
  - **Automática:** O sistema pode analisar um projeto e contratar Personas automaticamente, notificando o usuário sobre o novo "membro da equipe".
  - **Manual:** O usuário pode criar Personas através de um wizard assistido por IA, definindo sua especialidade e personalidade.
- **3.2. Gerenciamento da Equipe:** O usuário pode visualizar, editar e "demitir" Personas de um projeto.

### Módulo 4: Fórum de Discussão do Projeto

**Visão:** Um espaço para colaboração estruturada e assíncrona, criando uma base de conhecimento persistente para as decisões e investigações do projeto.

- **4.1. Tópicos de Discussão:** O usuário ou as Personas podem iniciar discussões focadas em um sistema de tópicos.
- **4.2. Colaboração em Tópicos:** Dentro de um tópico, usuários e Personas podem postar mensagens e artefatos, permitindo que múltiplos especialistas de IA colaborem em um problema complexo.

### Módulo 5: Interação e Fluxo de Trabalho

**Visão:** O centro de comando conversacional do projeto, onde o trabalho é iniciado de forma natural e o progresso é monitorado de forma passiva.

- **5.1. Iniciação de Tarefas Conversacional:** O usuário expressa uma necessidade em linguagem natural no chat, e o sistema a converte em um ou mais Jobs internos.
- **5.2. Painel de Atividades:** O usuário tem acesso a um painel para **monitorar** o status dos Jobs (ex: Na Fila, Em Execução, Concluído), mas não para gerenciá-los ativamente.
- **5.3. Intervenção de Exceção:** O usuário pode pausar ou cancelar um Job em casos excepcionais.

---

## 3. Capacidades Conceituais de Suporte Técnico

### Sistema 1: Kernel da Aplicação
- **1.1. Orquestração de Fluxo de Dados:** Um mecanismo central para gerenciar as operações do sistema, separando as ações que modificam dados (Comandos) das que apenas leem dados (Queries).
- **1.2. Comunicação Assíncrona:** Um barramento de eventos para permitir que os diferentes módulos do sistema se comuniquem de forma desacoplada.

### Sistema 2: Camada de Persistência
- **2.1. Armazenamento de Dados:** Um sistema de banco de dados local para persistir todos os metadados da aplicação (projetos, personas, jobs, configurações, discussões do fórum, etc.).
- **2.2. Acesso a Dados:** Uma camada de abstração (como um ORM) para interagir com o banco de dados de forma segura e previsível.
- **2.3. Gerenciamento de Schema:** Um processo para gerenciar as mudanças na estrutura do banco de dados de forma versionada.

### Sistema 3: Comunicação com a Interface
- **3.1. Ponte Segura:** Um mecanismo para expor funcionalidades do backend para o frontend de forma segura, sem vazar detalhes de implementação.
- **3.2. Contrato de Interface:** Um conjunto de definições de tipos compartilhados que garantem que a comunicação entre o backend e o frontend seja consistente e à prova de erros.

### Sistema 4: Sistema de Filas de Tarefas
- **4.1. Filas de Tarefas Dedicadas:** Cada agente de IA ativo possui sua própria fila de tarefas persistente, garantindo que o trabalho seja isolado e processado em ordem pelo especialista correto.

### Sistema 5: Camada de Inteligência Artificial
- **5.1. Abstração de LLM:** Uma camada de serviço que encapsula a comunicação com modelos de linguagem grandes, permitindo que o provedor seja trocado sem grandes refatorações.
- **5.2. Gerenciamento de Prompts:** Um sistema para criar, gerenciar e versionar os prompts que definem o comportamento e as habilidades das Personas.

### Sistema 6: Interação com o Ambiente
- **6.1. Ferramentas de Sistema de Arquivos:** Um conjunto de capacidades seguras para os agentes lerem e escreverem arquivos dentro dos limites do diretório de um projeto.

### Sistema 7: Camada de Controle de Versão
- **7.1. Automação de Fluxo de Versionamento:** O sistema deve ser capaz de executar operações de controle de versão (como `pull`, `commit`, `push`) de forma autônoma, como parte do ciclo de vida de uma tarefa.
- **7.2. Provisionamento de Repositório:** O sistema deve ser capaz de provisionar novos projetos, seja inicializando um novo repositório ou clonando um existente.
- **7.3. Gerenciamento de Credenciais:** Um mecanismo para armazenar e usar de forma segura as credenciais necessárias para interagir com serviços de hospedagem de código.

### Sistema 8: Camada de Análise de Código
- **8.1. Análise de Dependências:** A capacidade de inspecionar a base de código de um projeto para identificar sua stack tecnológica e dependências, a fim de suportar a contratação automática de Personas.

### Sistema 9: Modelo de Execução do Agente
- **9.1. Processos de Agentes Persistentes:** Um "Agente" é um processo de trabalho de longa duração. Um novo processo de Agente é iniciado para cada Persona "contratada" e permanece ativo, aguardando por tarefas em sua fila dedicada.

### Sistema 10: Orquestrador de Intenção
- **10.1. Processamento de Linguagem Natural:** O cérebro do sistema, que usa um modelo de linguagem para analisar a conversa do usuário e classificar sua intenção (ex: pedido de tarefa, pergunta, etc.).
- **10.2. Roteamento de Tarefas:** Um mecanismo de decisão que, dada uma tarefa, a atribui à Persona mais qualificada com base em suas habilidades definidas.
- **10.3. Enfileiramento de Tarefas:** Após rotear uma tarefa, o orquestrador a coloca na fila de trabalho específica do agente selecionado.