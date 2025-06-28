# Introdução ao Project Wiz

Bem-vindo ao Project Wiz! Seu propósito é ser um sistema ElectronJS para automatizar tarefas de desenvolvimento usando modelos LLM (Large Language Models) localmente, permitindo que a LLM trabalhe de forma autônoma em repositórios GitHub.

Este guia é destinado a ajudar você, usuário, a compreender o que é o Project Wiz, para quem ele se destina e como você pode se beneficiar de suas funcionalidades.

## O que é o Project Wiz?

O Project Wiz é uma aplicação desktop inovadora, com uma interface inspirada no Discord, projetada para funcionar como uma **fábrica de software autônoma**. Seu núcleo é composto por Agentes de Inteligência Artificial, chamados [Personas](./05-personas-agents.md), que colaboram e auxiliam no processo de desenvolvimento de software.

O objetivo é automatizar diversas etapas do ciclo de vida de desenvolvimento, desde a análise e design até a implementação, testes e deployment, tornando o processo mais eficiente e inteligente.

## Para quem é o Project Wiz?

O Project Wiz é ideal para:

*   **Desenvolvedores e Times de Desenvolvimento:** Que buscam automatizar tarefas repetitivas, acelerar o desenvolvimento e focar em aspectos mais estratégicos e criativos dos projetos.
*   **Gerentes de Projeto:** Que precisam de ferramentas para orquestrar tarefas complexas e acompanhar o progresso de forma eficiente.
*   **Empresas de Software:** Que desejam aumentar a produtividade de suas equipes e otimizar o fluxo de trabalho de desenvolvimento.
*   **Entusiastas de IA e Automação:** Interessados em explorar o potencial de agentes de IA aplicados ao desenvolvimento de software.

## O que você pode fazer com o Project Wiz?

Com o Project Wiz, você poderá:

*   [Gerenciar seus projetos de software](./04-managing-projects.md) em um ambiente centralizado.
*   Criar e configurar [Personas (Agentes de IA)](./05-personas-agents.md) especializadas para diferentes papéis.
*   Definir e atribuir [Jobs (tarefas)](./06-jobs-automation.md) para suas Personas executarem, abrangendo atividades como:
    *   Geração de código
    *   Análise de código
    *   Criação de pull requests (planejado)
    *   Geração de documentação
    *   Análise de issues (planejado)
*   Configurar parâmetros dos modelos de linguagem utilizados pelas Personas.
*   Definir fluxos de trabalho de automação.
*   Acompanhar o progresso das tarefas e a performance dos seus agentes.
*   Interagir com as Personas através de uma interface de chat.
*   E muito mais à medida que o projeto evolui!

## Como Funciona: A Interação Principal

A interação típica com o Project Wiz e seus Agentes de IA segue um fluxo como este:

1.  **Conversa e Delegação:** Você interage com um Agente IA (uma instância de uma [Persona](./core-concepts/personas-and-agents.md) configurada) através de uma interface de chat, descrevendo uma necessidade ou objetivo no contexto de um [Projeto](./core-concepts/projects.md).
2.  **Planejamento pelo Agente:** O Agente, utilizando seu Modelo de Linguagem Grande (LLM) e lógica interna, analisa seu pedido. Ele elabora um plano de ação, que pode incluir a decomposição da tarefa em [Jobs e Sub-Jobs](./core-concepts/jobs-and-automation.md), e define critérios de "Definição de Pronto" para o trabalho.
3.  **Aprovação do Usuário (Ponto de Verificação Opcional):** Para tarefas mais complexas, o Agente pode ser instruído a apresentar o plano e a "Definição de Pronto" para sua aprovação antes de iniciar o trabalho principal.
4.  **Execução Autônoma:** Após a aprovação (ou se não for um passo requerido para a tarefa), o Agente começa a processar os Jobs. Ele utiliza sua inteligência (LLM) e Ferramentas disponíveis (como acesso ao sistema de arquivos, terminal, etc.) para executar as etapas. Para tarefas de código, o Agente opera dentro do diretório de trabalho do projeto, geralmente em um branch Git específico.
5.  **Auto-Validação (Orientada pelo Agente):** O Agente pode realizar uma auto-validação interna, comparando os resultados com os critérios de "Definição de Pronto" estabelecidos, para garantir que os resultados atendam ao esperado.
6.  **Acompanhamento e Entrega:** Você pode acompanhar o progresso dos Jobs. Ao final, o Agente entrega o resultado (ex: um novo branch Git com código modificado, um relatório, etc.). Você pode então continuar a interação para feedback ou ajustes.

Para começar a usar a aplicação, recomendamos seguir nosso [Guia de Início Rápido](./02-quick-start.md). Para uma visão geral da interface, consulte a [Visão Geral da Interface do Usuário](./03-interface-overview.md). Navegue pelas próximas seções deste guia para aprender como utilizar as principais funcionalidades do Project Wiz.
