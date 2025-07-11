# Arquitetura do Sistema

Este documento descreve a arquitetura do Sistema de Fábrica de Software Autônoma Local, detalhando seus componentes, a comunicação entre eles, as tecnologias propostas e as estratégias para gerenciamento de recursos.

## 1. Visão Geral da Arquitetura

O Project Wiz é uma aplicação desktop construída com Electron.js, o que implica uma arquitetura de dois processos principais: o **Processo Principal (Main Process)** e o **Processo de Renderização (Renderer Process)**. A arquitetura segue princípios de Clean Architecture e Domain-Driven Design (DDD), com uma forte separação de responsabilidades e o uso do padrão CQRS (Command Query Responsibility Segregation).

## 2. Diagrama de Componentes (Descrição Textual)

Como não é possível gerar um diagrama visual, os componentes e suas interações serão descritos textualmente.

### Componentes Principais:

*   **Interface do Usuário (UI) / Renderer Process:**
    *   **Tecnologia:** React, TypeScript, Tailwind CSS.
    *   **Responsabilidade:** Renderizar a interface gráfica, capturar interações do usuário e enviar requisições para o Processo Principal via IPC.
    *   **Interage com:** Processo Principal (via IPC).

*   **Processo Principal (Main Process):**
    *   **Tecnologia:** Node.js, TypeScript, Electron Main API.
    *   **Responsabilidade:** O "cérebro" da aplicação. Orquestração geral, lógica de negócio, interação com o sistema de arquivos, acesso ao banco de dados, comunicação com serviços externos (LLMs) e gerenciamento do ciclo de vida da aplicação Electron.
    *   **Interage com:** Renderer Process (via IPC), Banco de Dados (SQLite/Drizzle ORM), Agentes LLM (internamente), Ferramentas Externas (Git CLI, Shell).

*   **Agentes LLM (Componentes Internos do Main Process):**
    *   **Tecnologia:** Node.js, TypeScript, AI SDK (para LLMs).
    *   **Responsabilidade:** Executar tarefas autônomas, interagir com o código-fonte, gerar documentação, gerenciar o workflow Git. Os agentes são criados dinamicamente em tempo de execução conforme a necessidade do sistema. Um assistente de usuário será o único agente "built-in", disponível em mensagens diretas e em todos os projetos.
    *   **Interage com:** Ferramentas Externas (Git CLI, Shell, Sistema de Arquivos - diretamente), APIs de LLM externas, e Processo Principal (apenas para atualização de progresso e comunicação com a UI).

*   **Banco de Dados (SQLite):**
    *   **Tecnologia:** SQLite, Drizzle ORM.
    *   **Responsabilidade:** Persistir o estado da aplicação (projetos, agentes, tarefas, mensagens, issues, sprints).
    *   **Interage com:** Processo Principal (via Drizzle ORM).

*   **Ferramentas Externas (CLI):**
    *   **Tecnologia:** Git CLI, Shell (Bash/CMD).
    *   **Responsabilidade:** Execução de comandos de controle de versão e comandos de sistema operacional.
    *   **Interage com:** Processo Principal (via execução de subprocessos).

*   **Serviços de LLM Externos:**
    *   **Tecnologia:** APIs de OpenAI, DeepSeek, etc.
    *   **Responsabilidade:** Fornecer capacidades de geração de texto, código, análise e planejamento para os Agentes LLM.
    *   **Interage com:** Agentes LLM (via Processo Principal como proxy).

## 3. Diagrama de Implantação (Descrição Textual)

O sistema será implantado como um único pacote de aplicação desktop, contendo todos os componentes necessários.

*   **Dispositivo do Usuário (Host):**
    *   **Sistema Operacional:** Windows, macOS, Linux.
    *   **Aplicação Project Wiz:**
        *   **Executável Electron:** Contém o Processo Principal e o Processo de Renderização.
        *   **Recursos Empacotados:** Código-fonte (JS/TS compilado), assets da UI, banco de dados SQLite (`project-wiz.db`).
        *   **Dependências:** Node.js Runtime (embutido pelo Electron), Git CLI (assumido como pré-instalado no sistema do usuário ou empacotado).
    *   **Conexão Externa:** Acesso à Internet para comunicação com APIs de LLM externas.

## 4. Tecnologias Propostas e Justificativas

*   **Electron.js:** Permite construir aplicações desktop multiplataforma usando tecnologias web (HTML, CSS, JavaScript/TypeScript), aproveitando a familiaridade dos desenvolvedores web e a capacidade de empacotar a aplicação para diferentes SOs.
*   **React:** Biblioteca robusta e popular para construção de interfaces de usuário interativas e reativas, ideal para o frontend complexo e dinâmico.
*   **TypeScript:** Adiciona tipagem estática ao JavaScript, melhorando a robustez, manutenibilidade e legibilidade do código, tanto no frontend quanto no backend.
*   **Node.js:** Ambiente de execução JavaScript no lado do servidor, perfeito para o Processo Principal do Electron, que lida com lógica de negócio, sistema de arquivos e comunicação de rede.
*   **Tailwind CSS:** Framework CSS utilitário que acelera o desenvolvimento da UI e garante consistência visual.
*   **SQLite:** Banco de dados leve, embutido e baseado em arquivo, ideal para persistência local em aplicações desktop, eliminando a necessidade de configuração de servidor de DB.
*   **Drizzle ORM:** ORM moderno e tipado para TypeScript, que simplifica a interação com o SQLite e garante segurança de tipo nas operações de banco de dados.
*   **AI SDK (OpenAI, DeepSeek):** Bibliotecas que facilitam a integração com diversos modelos de linguagem grandes, abstraindo as complexidades das APIs.
*   **Git CLI:** Ferramenta de controle de versão padrão da indústria, utilizada diretamente pelos agentes para gerenciar repositórios.
*   **Pino.js:** Um logger extremamente rápido e de baixo overhead para Node.js, ideal para registrar eventos e depurar a aplicação.

## 5. Comunicação entre os Processos Electron (Main e Renderer)

*   **IPC (Inter-Process Communication):** Toda a comunicação entre o Processo Principal e o Processo de Renderização DEVE ser realizada via IPC.
    *   **Renderer para Main:** O Renderer Process enviará comandos e requisições para o Main Process usando `ipcRenderer.invoke()`.
    *   **Main para Renderer:** O Main Process enviará eventos e atualizações de estado para o Renderer Process usando `ipcMain.handle()` ou `webContents.send()`.
*   **Canais IPC:** Canais IPC bem definidos e tipados (usando `shared/ipc-types`) DEVE ser utilizados para cada tipo de comunicação (ex: `project:create`, `agent:message`, `filesystem:readFile`).
*   **Serialização:** Dados complexos DEVE ser serializados (ex: JSON) antes de serem enviados via IPC.


