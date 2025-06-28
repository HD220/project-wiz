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

## 5. Criando sua Primeira Persona

As Personas no Project Wiz são templates para seus Agentes de IA. Elas definem como um Agente deve se comportar e quais são suas capacidades.

*   **Definindo uma Persona:** Ao criar um template de Persona, você configurará:
    *   **Nome:** Um nome descritivo para o template (ex: "Desenvolvedor Frontend Júnior", "Revisor de Código Detalhista").
    *   **Papel (Role):** A especialização principal do Agente (ex: "Developer", "QA Tester", "Documentation Writer").
    *   **Objetivo (Goal):** O objetivo de alto nível que Agentes baseados neste template buscarão alcançar.
    *   **Backstory/Contexto:** Informações de fundo que ajudam a definir a personalidade e o conhecimento do Agente, usadas para construir o prompt de sistema para o LLM.
    *   **Ferramentas (Tools):** Uma lista das ferramentas específicas que o Agente terá permissão para usar (ex: acesso ao sistema de arquivos, terminal, ferramentas de busca).
*   **De Template para Agente:** Estes templates de Persona são então usados para criar instâncias de Agentes IA que efetivamente realizarão os trabalhos, combinando o template com configurações específicas de LLM (como qual modelo usar e sua temperatura).
*   **Saiba Mais:**
    *   Para um mergulho profundo na criação e utilização de Personas e Agentes, veja [Personas e Agentes IA](./core-concepts/personas-and-agents.md).

## 6. Atribuindo seu Primeiro Job

Jobs são as tarefas que você atribui às suas Personas (ou mais precisamente, aos Agentes IA criados a partir dos templates de Persona).

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
