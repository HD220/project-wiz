# Visão Geral da Aplicação Project Wiz

## Visão

A visão de longo prazo do Project Wiz é **transformar fundamentalmente o ciclo de vida do desenvolvimento de software através da colaboração inteligente entre humanos e Agentes de IA autônomos.** Aspiramos criar uma plataforma onde Agentes de IA sejam membros integrais e proativos das equipes de desenvolvimento, capazes de lidar com tarefas complexas de ponta a ponta.

## Propósito Central

O Project Wiz visa ser uma **"fábrica de software autônoma"**, funcionando como uma aplicação desktop local com uma interface de usuário visualmente inspirada no Discord. Seu propósito central é fornecer uma plataforma onde um único usuário humano possa gerenciar, direcionar e colaborar com Personas de IA (Agentes de IA especializados). Essas Personas então automatizam и aprimoram o processo de desenvolvimento de software. O sistema é projetado para esta interação direta usuário-Persona no gerenciamento e execução de tarefas de desenvolvimento de software, aproveitando a IA para trazer um novo nível de eficiência e inteligência para o fluxo de trabalho do desenvolvedor individual.

## Objetivos Chave

O projeto se esforça para alcançar vários objetivos chave:

*   **Capacitar Agentes de IA para Tarefas Complexas:** Desenvolver Personas de IA capazes de realizar uma ampla gama de tarefas de desenvolvimento, incluindo análise, design, codificação, testes e documentação.
*   **Automação Inteligente:** Ir além de scripts simples para implementar automação inteligente em todo o ciclo de vida do desenvolvimento, adaptando-se a várias necessidades e tecnologias de projeto.
*   **Empoderar Desenvolvedores Humanos:** Liberar desenvolvedores humanos de tarefas repetitivas e demoradas, permitindo que eles se concentrem na inovação, resolução de problemas complexos, arquitetura de alto nível e tomada de decisões estratégicas.
*   **Aumentar a Velocidade e Eficiência do Desenvolvimento:** Tornar o processo de desenvolvimento de software significativamente mais rápido, otimizado e econômico.

## Público-Alvo

O Project Wiz é projetado para um público diversificado dentro do ecossistema de desenvolvimento de software:

*   **Desenvolvedores e Times de Desenvolvimento:** Aqueles que buscam automatizar tarefas repetitivas, acelerar seus fluxos de trabalho e focar em aspectos mais criativos e estratégicos do desenvolvimento.
*   **Gerentes de Projeto:** Indivíduos que precisam de ferramentas para orquestrar tarefas complexas, gerenciar recursos (incluindo Agentes de IA) e acompanhar eficientemente o progresso do projeto.
*   **Empresas de Software:** Organizações que visam aumentar a produtividade de suas equipes de desenvolvimento e otimizar seu ciclo de vida de desenvolvimento geral.
*   **Entusiastas e Pesquisadores de IA:** Interessados em explorar e avançar a aplicação de Agentes de IA em contextos práticos de engenharia de software.

## O Que os Usuários Podem Fazer

O Project Wiz oferece aos usuários uma gama de funcionalidades para gerenciar e automatizar seus esforços de desenvolvimento de software:

*   **Gerenciar Projetos:** Centralizar e supervisionar projetos de software dentro da aplicação.
*   **Criar e Configurar Personas:** Definir, personalizar e gerenciar Personas de IA (que configuram como um LLM subjacente se comportará) com papéis, objetivos, históricos (backstories), configurações de LLM e `Tools` habilitadas específicas.
*   **Solicitar Tarefas e Projetos às Personas:** Iniciar trabalhos e delegar tarefas complexas através da interação conversacional com as Personas. Estas, por sua vez, criam e gerenciam seus próprios `Jobs` (unidades de trabalho internas) para atender às solicitações, podendo definir dependências entre eles e influenciar suas prioridades.
*   **Interagir com Personas:** Comunicar-se com Personas (e potencialmente testemunhar a comunicação inter-Persona) através de uma interface de chat para fornecer instruções, esclarecer requisitos, receber atualizações e colaborar em tarefas.
*   **Monitorar o Progresso:** Acompanhar o status dos `Jobs` criados pelas Personas, revisar os resultados e monitorar o desempenho das Personas de IA e do sistema como um todo.
*   **Configurar LLMs:** Definir parâmetros para os Modelos de Linguagem Amplos (LLMs) que potencializam as Personas.

## Key Technologies

Esta seção fornece uma visão geral de alto nível das principais tecnologias e frameworks utilizados no Project Wiz.

*   **Electron:** Serves as the foundational framework for building Project Wiz as a cross-platform desktop application, enabling the use of web technologies for the user interface and application logic.
*   **Vite:** A modern frontend build tool used to provide a fast and efficient development experience for the web-based parts of the application.
*   **React:** A JavaScript library that forms the backbone of the user interface, allowing for the creation of dynamic and interactive components.
*   **TypeScript:** A superset of JavaScript that adds static typing. It is used throughout the project to improve code quality, maintainability, and developer productivity by catching errors early.
*   **Tailwind CSS:** A utility-first CSS framework employed for rapidly building custom user interfaces with a consistent design language.
*   **Drizzle ORM:** A TypeScript-friendly Object-Relational Mapper used to facilitate interactions with the application's database in a type-safe manner.
*   **SQLite (via better-sqlite3):** Acts as the primary lightweight, file-based SQL database engine, storing application data locally.
*   **LinguiJS:** A library integrated for internationalization (i18n) purposes, enabling Project Wiz to support multiple languages.
*   **TanStack Router:** A routing library responsible for managing navigation and views within the React-based frontend of the application.
*   **Zod:** A TypeScript-first schema declaration and validation library used to ensure data integrity and structure, particularly for inputs and configurations.
*   **Vitest:** A fast and modern testing framework utilized for writing and running unit and integration tests to ensure code reliability.
*   **AI SDK (OpenAI, DeepSeek):** Software Development Kits or libraries are used to integrate with and manage communications with various Large Language Models (LLMs) like those from OpenAI and DeepSeek, which power the Personas.
*   **UI Components (inspired by shadcn/ui):** The user interface is constructed using a collection of pre-built, customizable UI components. These components are likely based on foundational libraries like Radix UI and styled with Tailwind CSS, following patterns similar to those popularized by shadcn/ui for a consistent and modern look and feel.
