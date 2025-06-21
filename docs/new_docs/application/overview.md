# Visão Geral da Aplicação Project Wiz

## Visão

A visão de longo prazo do Project Wiz é **transformar fundamentalmente o ciclo de vida do desenvolvimento de software através da colaboração inteligente entre humanos e Agentes de IA autônomos.** Aspiramos criar uma plataforma onde Agentes de IA sejam membros integrais e proativos das equipes de desenvolvimento, capazes de lidar com tarefas complexas de ponta a ponta.

## Propósito Central

O Project Wiz visa ser uma **"fábrica de software autônoma"**, funcionando como uma aplicação desktop local com uma interface de usuário visualmente inspirada no Discord. Seu propósito central é fornecer uma plataforma onde um único usuário humano possa gerenciar, direcionar e colaborar com Personas de IA. Estas Personas são essencialmente configurações e conjuntos de instruções especializadas que guiam Modelos de Linguagem Amplos (LLMs) para automatizar e aprimorar o processo de desenvolvimento de software. O sistema é projetado para esta interação direta usuário-Persona no gerenciamento e execução de tarefas de desenvolvimento de software, aproveitando o poder dos LLMs, moldado pelas Personas, para trazer um novo nível de eficiência e inteligência para o fluxo de trabalho do desenvolvedor individual.

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

*   **Gerenciar Projetos:** Centralizar e supervisionar projetos de software dentro da aplicação, incluindo a configuração de seus respectivos `caminhos de working_directory`.
*   **Criar e Configurar Personas:** Definir, personalizar e gerenciar Personas de IA (que configuram como um LLM subjacente se comportará) com papéis, objetivos, históricos (backstories), configurações de LLM e `Tools` habilitadas específicas.
*   **Delegar Tarefas e Acompanhar Trabalhos das Personas:** Interagir com Personas via chat para descrever necessidades e objetivos. As Personas então analisam, planejam (podendo solicitar sua aprovação para a abordagem e "Definição de Pronto"), criam e executam os `Jobs` (e `Sub-Jobs`) necessários em suas filas dedicadas. Você pode acompanhar o progresso desses `Jobs`.
*   **Interagir com Personas:** Comunicar-se com Personas (e potencialmente testemunhar a comunicação inter-Persona) através de uma interface de chat para fornecer instruções, aprovar planos de ação, esclarecer requisitos, receber atualizações e colaborar em tarefas.
*   **Monitorar Progresso e Desempenho:** Acompanhar o status dos `Jobs` criados pelas Personas, revisar os resultados e monitorar o desempenho das Personas de IA e do sistema como um todo através de logs e painéis de Analytics.
*   **Revisar e Integrar Resultados:** Revisar o trabalho das Personas (ex: código em branches Git na `working_directory` do projeto, documentos gerados) e integrá-lo ao seu fluxo de trabalho principal.
*   **Configurar LLMs:** Definir parâmetros para os Modelos de Linguagem Amplos (LLMs) que potencializam as Personas.

## Key Technologies

Esta seção fornece uma visão geral de alto nível das principais tecnologias e frameworks utilizados no Project Wiz.

*   **Electron:** Serve como o framework fundamental para construir o Project Wiz como uma aplicação desktop multiplataforma, permitindo o uso de tecnologias web para a interface do usuário e lógica da aplicação.
*   **Vite:** Uma ferramenta de build moderna para o frontend, usada para fornecer uma experiência de desenvolvimento rápida e eficiente para as partes da aplicação baseadas na web.
*   **React:** Uma biblioteca JavaScript que forma a espinha dorsal da interface do usuário, permitindo a criação de componentes dinâmicos e interativos.
*   **TypeScript:** Um superconjunto do JavaScript que adiciona tipagem estática. É usado em todo o projeto para melhorar a qualidade do código, a manutenibilidade e a produtividade do desenvolvedor, detectando erros antecipadamente.
*   **Tailwind CSS:** Um framework CSS utility-first empregado para construir rapidamente interfaces de usuário customizadas com uma linguagem de design consistente.
*   **Drizzle ORM:** Um Object-Relational Mapper (ORM) amigável ao TypeScript, usado para facilitar as interações com o banco de dados da aplicação de forma type-safe.
*   **SQLite (via better-sqlite3):** Atua como o principal motor de banco de dados SQL leve e baseado em arquivo, armazenando dados da aplicação localmente (estado dos Jobs, AgentInternalState, etc.).
*   **InversifyJS:** Um container de Injeção de Dependência (DI) leve e poderoso para TypeScript. Será usado para gerenciar dependências entre classes, promovendo desacoplamento e melhorando a testabilidade, conforme delineado na arquitetura alvo.
*   **LinguiJS:** Uma biblioteca integrada para fins de internacionalização (i18n), permitindo que o Project Wiz suporte múltiplos idiomas.
*   **TanStack Router:** Uma biblioteca de roteamento para aplicações web, usada aqui provavelmente dentro do frontend React para gerenciar navegação e visualizações.
*   **Zod:** Uma biblioteca de declaração e validação de schemas "TypeScript-first", usada para garantir a integridade e estrutura dos dados, particularmente para entradas, configurações e o payload/opções dos Jobs.
*   **Vitest:** Um framework de teste moderno e rápido, utilizado para escrever e executar testes unitários e de integração para garantir a confiabilidade do código.
*   **AI SDK (OpenAI, DeepSeek, etc.):** Software Development Kits (SDKs) ou bibliotecas são usados para integrar e gerenciar comunicações com vários Modelos de Linguagem Amplos (LLMs), como os da OpenAI e DeepSeek, que potencializam as Personas.
*   **UI Components (inspired by shadcn/ui):** A interface do usuário é construída usando uma coleção de componentes de UI pré-construídos e customizáveis. Estes componentes são provavelmente baseados em bibliotecas fundamentais como Radix UI e estilizados com Tailwind CSS, seguindo padrões similares aos popularizados por shadcn/ui para um visual e usabilidade consistentes e modernos.
