# Entidades da Aplicação

Este documento descreve as principais entidades de dados dentro do Project Wiz, representando os componentes centrais de sua fábrica de software autônoma.

## Entidades Centrais

-   **Project:**
    -   **Propósito:** Representa um projeto de desenvolvimento de software distinto gerenciado dentro da aplicação Project Wiz. Serve como um contêiner para todo o trabalho relacionado, configurações e colaborações.
    -   **Atributos/Dados Chave:**
        -   Um identificador único para o projeto.
        -   O nome do projeto.
        -   Uma descrição geral dos objetivos e escopo do projeto.
        -   Informações sobre repositórios de código associados (ex: URLs Git).
        -   Uma lista de usuários humanos e Personas de IA que são membros ou estão atribuídos ao projeto.

-   **Persona (configuração do Agente):**
    -   **Propósito:** Uma `Persona` define a configuração (papel, objetivos, histórico, configurações específicas do LLM, `Tools` habilitadas) que molda como um Modelo de Linguagem Amplo (LLM) subjacente se comportará e interagirá para realizar tarefas. É a "personalidade" e o guia operacional para a IA de um Agente.
    -   **Atributos/Dados Chave:**
        -   Um identificador único para a configuração da `Persona`.
        -   **Nome, Papel, Objetivos, Histórico (Backstory):** Estes atributos são primariamente usados para construir o prompt de sistema e as instruções iniciais dadas ao LLM, guiando suas respostas e estilo de execução de tarefas.
        -   **Configuração do LLM:** Escolha específica do modelo (ex: OpenAI GPT-4, DeepSeek Coder), parâmetros (temperatura, máximo de tokens) e chaves de API.
        -   **`Tools` Habilitadas:** Uma lista de `Tools` pré-desenvolvidas que esta `Persona` está autorizada a usar. Estas `Tools` são descritas para o LLM (frequentemente através do AI SDK usado para integração), permitindo que ele solicite sua execução.

-   **Job (Activity):**
    -   **Propósito:** Representa uma unidade de trabalho, uma tarefa ou uma atividade específica, tipicamente criada por um `Agente` para si mesmo em resposta a uma solicitação do usuário ou como parte da decomposição de uma tarefa maior. É então atribuído e executado por esse `Agente` (que utiliza uma configuração de `Persona`). `Jobs` são os itens operacionais fundamentais gerenciados e processados pelo sistema.
    -   **Atributos/Dados Chave:**
        -   Um identificador único para o `Job`.
        -   Tipo/Nome: Categoriza o `Job` (ex: "GenerateCode", "RunTests", "AnalyzeIssue").
        -   Descrição: Explicação detalhada do que o `Job` implica.
        -   Status: Estado atual (ex: pendente, em execução, finalizado, falhou, aguardando, atrasado).
        -   Prioridade: Embora uma prioridade base possa ser definida, ela é frequentemente gerenciada dinamicamente ou influenciada pelo `Agente`/LLM com base no contexto e dependências.
        -   Dados de Entrada/Payload: Dados/parâmetros para a `Persona` (Agente) iniciar o `Job`.
        -   Referência aos Dados do `ActivityContext`: Link para seu `ActivityContext` específico.
        -   Dados de Saída/Resultado: Informações/artefatos gerados.
        -   Marcas de tempo de Criação/Atualização.
        -   Máximo de Tentativas, Tentativas Atuais para retentativas.
        -   `depends_on_job_ids`: Uma lista de outros IDs de `Job` que devem ser concluídos antes que este `Job` possa começar, habilitando o gerenciamento de dependências.
        -   `parent_job_id`: Um identificador para um `Job` pai, se este `Job` faz parte de uma decomposição hierárquica de tarefa maior.

-   **ActivityContext:**
    -   **Propósito:** Contém informações contextuais específicas e dinâmicas para uma única instância de `Job` ativa sendo processada por um `Agente`. Guia o LLM (através da configuração da `Persona`) em seu fluxo de execução e tomada de decisão para aquele `Job`. Este contexto é continuamente atualizado conforme o `Job` progride.
    -   **Atributos/Dados Chave:**
        -   Mensagem/instrução inicial que definiu ou acionou o `Job`.
        -   Detalhes do remetente/originador.
        -   Objetivo específico atual para esta instância do `Job`.
        -   Histórico de interações/mensagens relacionadas a este `Job` (ex: uma sequência de `CoreMessages` se estiver usando um AI SDK como o Vercel AI SDK), formando a memória conversacional para o LLM.
        -   Passos planejados ou sub-tarefas (frequentemente gerados pelo LLM durante o planejamento inicial).
        -   Notas, observações ou resultados intermediários registrados pelo `Agente`/LLM.
        -   `validationCriteria`: A "Definição de Pronto" para o `Job`, frequentemente definida pelo `Agente`/LLM durante sua fase de planejamento, delineando o que constitui sucesso.
        -   `validationResult`: O resultado da auto-validação do `Agente`/LLM em relação aos `validationCriteria`.
        -   Anotações ou informações chave deste `Job` que podem ser consideradas importantes o suficiente pelo `Agente` para serem promovidas ao seu `AgentInternalState` para recordação a longo prazo.

-   **AgentInternalState:**
    -   **Propósito:** Representa a memória persistente de médio a longo prazo e o estado evolutivo de um `Agente` (a lógica subjacente que utiliza uma configuração de `Persona`). Isso permite que um `Agente` mantenha continuidade, aprenda com interações passadas através de múltiplos `Jobs` e aplique um contexto mais amplo às suas tarefas.
    -   **Atributos/Dados Chave:**
        -   ID do `Agente` ao qual pertence.
        -   ID do `Project` atual e/ou ID da Issue em que o `Agente` pode estar focado.
        -   Meta ou diretiva geral de alto nível atual para o `Agente`.
        -   Uma lista ou referência a todas as `Activities` (`Jobs`) gerenciadas ou processadas por este `Agente`, permitindo que ele entenda sua própria carga de trabalho e histórico.
        -   Uma coleção de "promessas" ou compromissos feitos pelo `Agente` (ao usuário ou a outros Agentes).
        -   Notas gerais, conhecimento acumulado e insights destilados (aprendizados) coletados pelo `Agente` de `ActivityContexts` anteriores ou interações diretas.
        -   Este estado fornece contexto contínuo ao `Agente`, diferenciando-o do `ActivityContext` por `Job`.

-   **Tool:**
    -   **Propósito:** Uma função ou capacidade específica, pré-desenvolvida dentro do código fonte do Project Wiz, que um `Agente` (através de seu LLM) pode solicitar que seja executada para realizar tarefas ou interagir com seu ambiente.
    -   **Atributos/Dados Chave:**
        -   Nome da `Tool` (ex: `ReadFileTool`, `CommitToGitRepoTool`, `SendMessageToAgentTool`, `PostToProjectChannelTool`).
        -   Descrição de suas capacidades, parâmetros de entrada e formato de saída esperado (esta informação é tipicamente fornecida ao LLM através de um AI SDK para que ele saiba como e quando usar a `Tool`).
        -   O código real que implementa a lógica da `Tool`.

-   **Task:**
    -   **Propósito:** Representa um objetivo específico ou um prompt focado que a lógica interna do `Agente` direciona ao LLM (configurado pela `Persona`). O LLM então tenta alcançar esta `Task`, frequentemente planejando e utilizando `Tools` disponíveis. Uma `Task` não é uma sequência pré-codificada de `Tools`, mas sim o objetivo para o qual o LLM trabalha.
    -   **Atributos/Dados Chave:**
        -   Descrição do objetivo ou problema a ser resolvido.
        -   Contexto de entrada (derivado do `ActivityContext` e `AgentInternalState`).
        -   Restrições ou instruções específicas para o LLM.

-   **User:**
    -   **Propósito:** Representa um usuário humano que interage com a aplicação Project Wiz.
    -   **Atributos/Dados Chave:**
        -   ID do Usuário, Nome, Informações de Perfil.

## Entidades Conceituais

Estas entidades descrevem aspectos funcionais chave do sistema, em vez de modelos de dados diretos que são frequentemente persistidos da mesma forma que as entidades centrais.

-   **Queue (Fila de Jobs):**
    -   **Propósito:** Gerencia o ciclo de vida dos `Jobs`, inspirada por sistemas robustos como BullMQ.
    -   **Função:** Fornece enfileiramento confiável de `Jobs` com funcionalidades como:
        -   Persistência de `Jobs` (ex: usando SQLite via Drizzle ORM).
        -   Gerenciamento de dependências de `Jobs` (`depends_on_job_ids`).
        -   Gerenciamento de prioridade (embora a prioridade real possa ser dinamicamente influenciada por `Agentes` interagindo com seus próprios `Jobs` via `Tools`).
        -   Suporte para retentativas (retries) com estratégias de backoff configuráveis.
        -   Agendamento de `Jobs` ou execução atrasada.
        -   Emissão de eventos relacionados a mudanças de status de `Jobs`, permitindo que outras partes do sistema (como a UI ou um `Agente`) reajam.
        -   Garante que os `Jobs` sejam selecionados pelos `Agentes` disponíveis para processamento.

-   **Worker (Loop de Execução do Agente):**
    -   **Propósito:** Conceitualmente, um "Worker" no Project Wiz representa o loop de processamento assíncrono individual de um único `Agente`. Cada `Agente` efetivamente atua como seu próprio worker para os `Jobs` que ele cria ou lhe são atribuídos.
    -   **Função:** Um `Agente` (como Worker) solicita seu próximo `Job`/`Task` de sua representação interna de sua fila (que é originada da `Queue` principal), carrega o contexto necessário (`AgentInternalState`, `ActivityContext`) e o processa sequencialmente. A concorrência em nível de sistema é alcançada através de múltiplos `Agentes` distintos operando simultaneamente, cada um com seu próprio loop assíncrono, em vez de um único `Job` ser paralelizado através de múltiplos threads de worker tradicionais.
