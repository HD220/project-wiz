# Product Requirements Document (PRD)

## 1. Visão Geral do Produto

O Project Wiz é um sistema inovador de "Fábrica de Software Autônoma Local" projetado para transformar a maneira como equipes de desenvolvimento interagem com a inteligência artificial. Ele provê um ambiente de desenvolvimento de software colaborativo, onde um usuário (atuando como Gerente de Produto ou Gerente de Equipe) interage com agentes de IA (LLMs) que são criados dinamicamente conforme a necessidade do sistema. A interface do usuário, inspirada em plataformas de comunicação como o Discord, proporciona uma experiência intuitiva e familiar, permitindo que o usuário gerencie projetos e acompanhe o progresso da equipe de IA. Um assistente de usuário será o único agente "built-in", facilitando as primeiras interações e estando disponível em mensagens diretas e em todos os projetos.

## 2. Metas do Produto e Objetivos de Negócio

*   **Otimizar o Ciclo de Desenvolvimento:** Reduzir o tempo e o esforço necessários para desenvolver software, automatizando tarefas repetitivas e complexas.
*   **Aumentar a Produtividade:** Capacitar equipes a entregar mais valor em menos tempo, liberando desenvolvedores humanos para focar em inovação e problemas de alto nível.
*   **Democratizar o Desenvolvimento de Software:** Permitir que usuários com diferentes níveis de experiência gerenciem projetos de software complexos com o auxílio de IA.
*   **Promover a Colaboração Inteligente:** Estabelecer um novo paradigma de colaboração entre humanos e IA, onde os agentes atuam como membros proativos da equipe.
*   **Garantir a Qualidade do Código:** Implementar mecanismos de validação e checagem automáticas para manter a integridade e a qualidade do código gerado pelos agentes.

## 3. Público-Alvo

O principal público-alvo são **Gerentes de Produto (POs)**, **Gerentes de Equipe**, **Líderes Técnicos** e **Desenvolvedores** que buscam otimizar seus fluxos de trabalho de desenvolvimento de software e explorar o potencial da IA na automação de tarefas.

## 4. Principais Funcionalidades e Casos de Uso

*   **Interface de Usuário Estilo Discord:** Gerenciamento de projetos (servidores), canais de comunicação, mensagens diretas com agentes.
*   **Interação Natural com Agentes:** Conversas baseadas em texto com agentes de IA que interpretam papéis humanos com base em suas personas (nome, papel, perfil, backstory, objetivo). Os agentes criam e definem tarefas com base nas necessidades identificadas na conversa, e o usuário pode atribuir tarefas apenas através do sistema de issues ou solicitando a um agente que assuma uma tarefa específica.
*   **Gerenciamento de Tarefas e Filas:** Cada agente possui uma fila de tarefas priorizada, com execução autônoma em segundo plano.
*   **Acesso Controlado a Ferramentas:** Agentes podem interagir com o sistema de arquivos (leitura/escrita) e executar comandos de shell de forma segura.
*   **Gestão de Projetos e Repositórios Git:** Criação/clonagem de repositórios, uso de `git worktree` para trabalho paralelo, fluxo de trabalho de branches e merges.
*   **Metodologia Scrum:** Suporte a épicos, features, histórias de usuário, sprints e backlog.
*   **Sistema de Issues:** Rastreamento de bugs, tarefas e melhorias, com potencial para integração externa.
*   **Documentação Integrada:** Visualização de documentação gerada pelos agentes diretamente na interface, com renderização de Markdown similar à interface do GitHub.
*   **Configuração de Provedores/Modelos:** Capacidade de configurar e gerenciar provedores e modelos de LLM através da interface do usuário.
*   **Configuração de System Prompts:** Capacidade de visualizar e alterar os system prompts utilizados pelos agentes e pelo sistema através da interface do usuário.

## 5. Escopo do MVP (Produto Mínimo Viável)

O MVP se concentrará nas funcionalidades essenciais para demonstrar o conceito de fábrica de software autônoma:

*   **Criação e Gerenciamento Básico de Projetos:** Capacidade de criar um novo projeto (repositório Git local vazio).
*   **Interação Unidirecional com Agentes:** O usuário pode atribuir tarefas a um agente e receber atualizações de status.
*   **Execução de Tarefas Simples:** Agentes podem realizar operações básicas de sistema de arquivos (criar/ler/escrever arquivos) e executar comandos de shell pré-definidos.
*   **Workflow Git Simplificado:** Agentes podem criar branches, fazer commits e merges básicos na branch principal.
*   **Interface de Comunicação Básica:** Um canal de texto para interação com o agente principal do projeto.

## 6. Considerações Não Funcionais

*   **Performance:** A aplicação deve ser responsiva, com baixo tempo de resposta para interações do usuário e execução eficiente das tarefas dos agentes.
*   **Segurança:** Mecanismos robustos para garantir a segurança do sistema de arquivos local e a execução controlada de comandos de shell pelos agentes.
*   **Escalabilidade:** A arquitetura deve permitir a adição de novos agentes e funcionalidades sem comprometer o desempenho.
*   **Manutenibilidade:** Código limpo, modular e bem documentado para facilitar futuras atualizações e expansões.
*   **Usabilidade:** Interface intuitiva e fácil de usar, mesmo para usuários não técnicos.
*   **Portabilidade:** Compatibilidade com os principais sistemas operacionais (Windows, macOS, Linux) devido ao uso do Electron.js.
*   **Persistência:** O estado dos projetos, agentes, tarefas e comunicações deve ser persistido de forma confiável.