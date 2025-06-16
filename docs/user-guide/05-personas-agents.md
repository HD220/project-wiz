# Guia: Configurando e Utilizando Personas (Agentes de IA)

As Personas são o coração da capacidade de automação do Project Wiz. São agentes de Inteligência Artificial especializados que você pode configurar para realizar uma variedade de tarefas de desenvolvimento de software. Este guia explica como você pode criá-las, configurá-las e interagir com elas.

## 1. O que é uma Persona no Project Wiz?

No Project Wiz, uma "Persona" é um agente de IA que você define com características e capacidades específicas. Pense nelas como membros virtuais da sua equipe, cada um com um papel, objetivos e até mesmo uma "personalidade" ou especialização.

Elas são projetadas para:

*   Executar **Jobs** (tarefas) de forma autônoma ou semi-autônoma.
*   Utilizar um conjunto de **Tools** (ferramentas) para interagir com o sistema, arquivos, código e LLMs.
*   Colaborar no ciclo de vida do desenvolvimento de software.

Você pode encontrar a área de gerenciamento de Personas na seção "Agentes (Personas)" na "Home (Visão Geral Global)" da aplicação.

## 2. Criando ou Gerando uma Nova Persona

Conforme o roadmap do projeto (veja [TODO_base_roadmap.md](../project-overview/TODO_base_roadmap.md)), estão planejadas as seguintes funcionalidades:

*   **Cadastro de Personas:** Permitirá que você crie uma Persona manualmente, definindo todos os seus atributos.
*   **Geração de Personas:** Possivelmente, o sistema oferecerá templates ou um processo assistido para gerar Personas com base em papéis comuns (ex: "Desenvolvedor Python Júnior", "Analista de Testes Cypress", "Revisor de Código Técnico").

Ao criar/gerar uma Persona, você definirá atributos chave:

*   **Nome da Persona:** Um identificador único.
*   **Papel (Role):** Sua especialização principal (ex: Engenheiro de Software, Analista de QA, Gerente de Projeto, Redator Técnico).
*   **Objetivos (Goals):** Metas gerais ou específicas que esta Persona deve tentar alcançar em seus trabalhos.
*   **Backstory:** Uma breve descrição que pode ajudar a definir o "estilo" de trabalho da Persona ou suas áreas de conhecimento mais profundas. Isso pode influenciar como ela interage ou aborda as tarefas.

*(A interface exata para criação e geração de Personas será detalhada conforme a funcionalidade é implementada.)*

## 3. Configurando uma Persona

Após a criação, você poderá configurar mais detalhes de uma Persona:

*   **Provedor de LLM e Modelo:** Selecionar qual modelo de linguagem grande (LLM) a Persona utilizará (ex: OpenAI GPT-4, DeepSeek Coder). Isso pode depender das integrações de LLM que você configurou no sistema.
*   **Temperatura e Outros Parâmetros do LLM:** Ajustar parâmetros como a "temperatura" para controlar a criatividade vs. precisão das respostas do LLM (funcionalidade planejada).
*   **Ferramentas (Tools) Habilitadas:** Definir quais Tools a Persona tem permissão para usar. Nem toda Persona precisará de acesso ao `TerminalTool`, por exemplo.
*   **Memória e Conhecimento Específico:** Configurar ou "treinar" a Persona com informações específicas do projeto ou da empresa (funcionalidade avançada planejada).

## 4. Interagindo com Personas

A principal forma de interação com as Personas é através da atribuição de **Jobs**.

*   **Atribuindo Jobs:** Você definirá tarefas (Jobs) e as designará para Personas específicas que sejam adequadas para o trabalho. Veja o guia [Automatizando Tarefas com Jobs](./06-jobs-automation.md) (em breve) para mais detalhes.
*   **Chat:** A interface do Project Wiz, similar ao Discord, permitirá que você converse diretamente com as Personas:
    *   Para dar instruções adicionais.
    *   Para pedir esclarecimentos sobre o progresso de um Job.
    *   Para receber notificações ou resultados.
    *   As Personas também podem usar a `MessageTool` para se comunicar com você ou outras Personas.

## 5. Gerenciando o Desempenho das Personas

*   **Analytics:** A seção de Analytics (tanto global quanto por projeto) fornecerá insights sobre o desempenho das Personas, tarefas concluídas, tempo gasto, etc.
*   **Autoanálise e Correção (Funcionalidade Futura):** Estão planejadas capacidades para que as Personas possam analisar seu próprio desempenho e, em certa medida, corrigir ou otimizar sua abordagem para futuras tarefas.

## Próximos Passos

*   Agora que você entende como configurar Personas, aprenda a colocar elas para trabalhar em: [Automatizando Tarefas com Jobs](./06-jobs-automation.md) (em breve).
*   Consulte a [Visão Geral da Interface](./03-interface-overview.md) para localizar as seções de gerenciamento de Agentes.

Este guia será atualizado à medida que as funcionalidades de gerenciamento e interação com Personas evoluem.
