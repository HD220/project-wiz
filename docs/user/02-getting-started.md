# Guia de Início Rápido

Este guia fornece os passos essenciais para você começar a usar o Project Wiz rapidamente.

## 1. Instalação

Atualmente, o Project Wiz é executado a partir do código-fonte. Para informações sobre como configurar o ambiente de desenvolvimento e executar a aplicação, por favor, consulte o guia de [Configuração do Ambiente de Desenvolvimento](../developer/01-development-setup.md).

*(Nota: Esta seção será atualizada quando houver instaladores disponíveis para diferentes sistemas operacionais.)*

## 2. Abrindo o Project Wiz

Após iniciar a aplicação conforme as instruções de desenvolvimento, a janela principal do Project Wiz será exibida.

## 3. Conhecendo a Interface Principal

Recomendamos que você se familiarize com as principais áreas da interface. O documento [Visão Geral da Interface](./03-interface-overview.md) fornece um mapa detalhado.

## 4. Seu Primeiro Projeto

Com o Project Wiz, você pode gerenciar seus projetos de software de forma centralizada. Veja como começar com seu primeiro projeto:

*   **Criando um Novo Projeto:** Você pode criar um novo projeto de software diretamente na interface do Project Wiz. Ao criar um projeto, você geralmente fornecerá:
    *   Um **Nome** para o seu projeto.
    *   Uma **Descrição** opcional.
*   **O que Acontece em Segundo Plano:** Quando você cria um projeto:
    *   O Project Wiz atribui um identificador único a ele.
    *   É criada uma estrutura de pastas básica no seu sistema de arquivos para o projeto, geralmente incluindo:
        *   `source-code/`: Onde o código principal do seu projeto residirá.
        *   `docs/`: Para a documentação específica do projeto.
        *   `worktrees/`: Áreas de trabalho que os Agentes IA podem usar.
    *   Um repositório Git é inicializado automaticamente na pasta `source-code/`, permitindo o controle de versão desde o início.
*   **Próximos Passos com Projetos:**
    *   Para mais detalhes sobre como gerenciar e configurar seus projetos, consulte o guia [Gerenciando Projetos](./core-concepts/projects.md).

## 5. Solicitando seu Primeiro Agente IA Especializado (Persona)

No Project Wiz, você conta com um **Assistente Pessoal IA** para ajudá-lo a dar o pontapé inicial nas suas tarefas. Para tarefas que exigem habilidades específicas, este assistente pode facilitar a criação de **Agentes IA Especializados**. Você também terá a capacidade de customizar e salvar as configurações desses agentes como "Personas Personalizadas" para uso futuro.

*   **Descrevendo sua Necessidade:**
    *   Comece conversando com seu Assistente Pessoal IA. Descreva a tarefa que você precisa realizar (ex: "Preciso criar testes unitários para o módulo de autenticação").
*   **Geração ou Seleção do Agente:**
    *   O Assistente Pessoal, com auxílio de um LLM, analisará sua solicitação.
    *   Ele poderá **sugerir uma configuração para um novo Agente IA especializado**, detalhando o papel (ex: "QA Tester"), objetivo, e as capacidades que ele usaria.
    *   Se você já tiver **"Personas Personalizadas" salvas** que se encaixem, o assistente poderá sugerir o uso de uma delas.
*   **Customização e Configuração:**
    *   Você terá a oportunidade de **revisar e customizar** as características do Agente proposto (seja ele novo ou baseado em uma Persona Personalizada). Isso inclui seu nome, papel, objetivo, backstory (contexto para o LLM) e as capacidades permitidas.
    *   Você também definirá qual modelo de LLM o Agente usará e outros parâmetros (como a "temperatura").
    *   Configurações que você aprova podem ser **salvas como uma nova "Persona Personalizada"** ou atualizar uma existente.
*   **Pronto para o Trabalho:** Uma vez configurado, este Agente IA (uma instância `Agent`) estará pronto para auxiliar na realização dos seus objetivos.
*   **Saiba Mais:**
    *   Para um mergulho profundo na interação com o Assistente Pessoal e no gerenciamento de suas Personas Personalizadas e Agentes IA, veja [Personas Personalizadas e Agentes IA](./core-concepts/personas-and-agents.md).

## 6. Delegando sua Primeira Tarefa de Alto Nível

Com o Project Wiz, você não se preocupa em criar "jobs" ou "tarefas" pequenas e detalhadas diretamente. Em vez disso, você delega objetivos de mais alto nível ao seu Assistente Pessoal IA.

*   **Como Delegar:**
    *   Inicie uma conversa com seu **Assistente Pessoal IA**.
    *   Descreva claramente o que você deseja alcançar (ex: "Refatorar o sistema de login para aumentar a segurança", "Gerar a documentação inicial para o novo módulo de pagamentos", "Analisar o código em busca de gargalos de performance").
*   **O que Acontece em Seguida:**
    *   O Assistente Pessoal, junto com outros Agentes IA especializados (sejam eles configurados por você ou gerados dinamicamente), analisará sua solicitação.
    *   Internamente, eles definirão as atividades e etapas necessárias para atingir seu objetivo.
    *   Você poderá acompanhar o progresso geral da sua solicitação e interagir com os agentes para fornecer feedback ou esclarecimentos, conforme descrito na [Introdução ao Project Wiz](./01-introduction.md#como-funciona-a-interação-principal).
*   **Foco no Objetivo:** Seu foco principal é comunicar claramente seus objetivos de alto nível; o Project Wiz e seus agentes cuidam da decomposição e execução das tarefas detalhadas.

## Próximos Passos

Explore as outras seções do Guia do Usuário para aprender mais sobre cada funcionalidade em detalhe, começando pela [Introdução ao Project Wiz](./01-introduction.md) se ainda não o fez.
