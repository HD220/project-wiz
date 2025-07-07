# Introdução ao Project Wiz

Bem-vindo ao Project Wiz! Seu propósito é ser um sistema ElectronJS para automatizar tarefas de desenvolvimento usando modelos LLM (Large Language Models) localmente, permitindo que a LLM trabalhe de forma autônoma em repositórios GitHub.

Este guia é destinado a ajudar você, usuário, a compreender o que é o Project Wiz, para quem ele se destina e como você pode se beneficiar de suas funcionalidades.

## O que é o Project Wiz?

O Project Wiz é uma aplicação desktop inovadora, com uma interface inspirada no Discord, projetada para funcionar como uma **fábrica de software autônoma**. Seu núcleo é composto pelo seu **Assistente Pessoal IA** e uma equipe de Agentes de Inteligência Artificial especializados ([Personas](./core-concepts/personas-and-agents.md)) que podem ser configurados por você ou gerados dinamicamente para colaborar e auxiliar no processo de desenvolvimento de software.

O objetivo é automatizar diversas etapas do ciclo de vida de desenvolvimento, desde a análise e design até a implementação, testes e deployment, tornando o processo mais eficiente e inteligente.

## Para quem é o Project Wiz?

O Project Wiz é ideal para:

*   **Desenvolvedores e Times de Desenvolvimento:** Que buscam automatizar tarefas repetitivas, acelerar o desenvolvimento e focar em aspectos mais estratégicos e criativos dos projetos.
*   **Gerentes de Projeto:** Que precisam de ferramentas para orquestrar tarefas complexas e acompanhar o progresso de forma eficiente.
*   **Empresas de Software:** Que desejam aumentar a produtividade de suas equipes e otimizar o fluxo de trabalho de desenvolvimento.
*   **Entusiastas de IA e Automação:** Interessados em explorar o potencial de agentes de IA aplicados ao desenvolvimento de software.

## O que você pode fazer com o Project Wiz?

Com o Project Wiz, você poderá:

*   [Gerenciar seus projetos de software](./02-projects.md) em um ambiente centralizado.
*   Contar com [Agentes de IA (Personas)](./03-personas-and-agents.md) especializados para diferentes papéis, seja utilizando configurações sugeridas dinamicamente pelo sistema, personalizando-as, ou definindo as suas próprias.
*   Delegar objetivos e tarefas complexas ao seu Assistente Pessoal IA, que coordenará Agentes IA especializados para realizar o trabalho, abrangendo atividades como:
    *   Geração de código
    *   Análise de código
    *   Criação de pull requests (planejado)
    *   Geração de documentação
    *   Análise de issues (planejado)
*   Configurar parâmetros dos modelos de linguagem utilizados pelas Personas.
*   Acompanhar o progresso das tarefas e a performance dos seus agentes.
*   Interagir com as Personas através de uma interface de chat.
*   E muito mais à medida que o projeto evolui!

## Como Funciona: A Interação Principal

A interação típica com o Project Wiz e seus Agentes de IA segue um fluxo como este:

1.  **Conversa e Delegação com o Assistente Pessoal:** Você interage com seu **Assistente Pessoal IA** através de uma interface de chat, descrevendo uma necessidade ou objetivo de alto nível no contexto de um [Projeto](./02-projects.md).
2.  **Análise e Planejamento Interno pelo Agente:** O Assistente Pessoal, ou um Agente IA especializado para o qual a tarefa foi delegada (seja uma [Persona](./03-personas-and-agents.md) que você configurou/salvou ou um agente gerado dinamicamente), analisa sua solicitação. Internamente, o agente elabora um plano de ação, definindo as atividades e etapas necessárias (seus próprios "jobs" ou "sub-jobs" internos) para alcançar o objetivo, incluindo critérios de "Definição de Pronto".
3.  **Aprovação do Usuário (Ponto de Verificação Opcional):** Para tarefas mais complexas ou antes de ações significativas, o Agente pode apresentar seu plano de alto nível ou os critérios de "Definição de Pronto" para sua aprovação via chat.
4.  **Execução Autônoma:** Após a aprovação (ou se não for um passo requerido), o Agente começa a executar as atividades que planejou. Ele utiliza sua inteligência (LLM) e suas capacidades designadas (como interagir com o sistema de arquivos, executar comandos, etc.) para realizar as etapas. Para tarefas de código, o Agente opera dentro do diretório de trabalho do projeto, geralmente em um branch Git específico.
5.  **Auto-Validação (Orientada pelo Agente):** O Agente pode realizar uma auto-validação interna, comparando os resultados com os critérios de "Definição de Pronto" estabelecidos para suas atividades internas.
6.  **Acompanhamento e Entrega:** Você pode acompanhar o progresso geral da sua solicitação ou o trabalho do agente através da interface (por exemplo, visualizando o status ou logs do agente, conforme a interface permitir). Ao final, o Agente, através do Assistente Pessoal, entrega o resultado do seu objetivo (ex: um novo branch Git com código modificado, um relatório, etc.). Você pode então continuar a interação para feedback ou ajustes.

Para começar a usar a aplicação, recomendamos seguir nosso [Guia de Início Rápido](./02-getting-started.md). Para uma visão geral da interface, consulte a [Visão Geral da Interface do Usuário](./03-interface-overview.md). Navegue pelas próximas seções deste guia para aprender como utilizar as principais funcionalidades do Project Wiz.
