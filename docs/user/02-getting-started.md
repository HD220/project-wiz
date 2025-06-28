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
*   **Pronto para o Trabalho:** Uma vez configurado, este Agente IA (uma instância `Agent`) estará pronto para receber [Jobs (tarefas)](./core-concepts/jobs-and-automation.md).
*   **Saiba Mais:**
    *   Para um mergulho profundo na interação com o Assistente Pessoal e no gerenciamento de suas Personas Personalizadas e Agentes IA, veja [Personas Personalizadas e Agentes IA](./core-concepts/personas-and-agents.md).

## 6. Atribuindo seu Primeiro Job

Jobs são as tarefas que você atribui aos seus Agentes IA (sejam eles Personas Personalizadas que você configurou ou agentes especializados gerados dinamicamente para uma tarefa).

*   **O que é um Job?** Um Job é a unidade fundamental de trabalho no Project Wiz. Ele geralmente inclui:
    *   **Nome:** Um nome descritivo para o Job.
    *   **Payload/Dados de Entrada:** A informação que o Agente precisa para realizar a tarefa, mais comumente um "objetivo" claro (ex: "Implementar a função X", "Revisar o arquivo Y para erros de lógica").
    *   **Persona/Papel Alvo:** Você direcionará o Job para um papel específico, e um Agente configurado para aquele papel o selecionará.
*   **Ciclo de Vida de um Job:**
    *   Os Jobs passam por diferentes status, como `PENDENTE`, `ATIVO`, `COMPLETADO` ou `FALHOU`.
    *   Os Jobs podem depender de outros Jobs, significando que só começarão após seus pré-requisitos serem concluídos.
*   **Explorando Jobs:**
    *   Para aprender tudo sobre como criar, gerenciar e monitorar Jobs, consulte [Jobs e Automação](./core-concepts/jobs-and-automation.md).

## Próximos Passos

Explore as outras seções do Guia do Usuário para aprender mais sobre cada funcionalidade em detalhe, começando pela [Introdução ao Project Wiz](./01-introduction.md) se ainda não o fez.
