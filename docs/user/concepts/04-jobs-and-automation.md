# Core Concept: Jobs e Automação

No Project Wiz, os **Jobs** são as unidades fundamentais de trabalho que você atribui aos seus [Agentes IA (Personas)](./personas-and-agents.md) para execução. O sistema de Jobs é o motor da automação na plataforma, permitindo que tarefas, desde simples análises até complexos desenvolvimentos, sejam decompostas, distribuídas e gerenciadas eficientemente.

## O que é um Job?

Um **Job** (também referido como Atividade ou Tarefa) representa uma solicitação específica para um Agente IA realizar.

**Características Principais de um Job:**

*   **ID Único:** Cada Job possui um identificador exclusivo.
*   **Nome (`name`):** Um nome descritivo para o Job (ex: "Implementar API de login", "Revisar documentação do usuário").
*   **Payload (`payload`):** Os dados de entrada essenciais para o Agente iniciar o trabalho. Frequentemente, isso inclui um **objetivo (`goal`)** claro e conciso (ex: "Criar uma função que some dois números e retorne o resultado").
*   **Dados (`data`):** Uma área onde o Agente armazena informações contextuais durante a execução, como o histórico de atividades (`ActivityContext`) e o histórico de execução do próprio Job.
*   **Status (`status`):** Indica o estado atual do Job no seu ciclo de vida. Os status comuns incluem:
    *   `PENDING`: Aguardando para ser processado.
    *   `ACTIVE`: Sendo ativamente trabalhado por um Agente.
    *   `COMPLETED`: Concluído com sucesso.
    *   `FAILED`: Falhou após tentativas.
    *   `DELAYED`: Adiado para execução futura.
    *   `WAITING`: Aguardando a conclusão de Jobs dos quais depende.
*   **Prioridade (`priority`):** Ajuda o sistema a decidir quais Jobs devem ser processados primeiro.
*   **Agente/Papel Alvo (`targetAgentRole`):** Especifica qual tipo de Agente (baseado no seu papel) é adequado para este Job.
*   **Dependências (`dependsOnJobIds`):** Um Job pode depender da conclusão de outros Jobs antes de poder começar.
*   **Job Pai (`parentJobId`):** Se um Job foi criado como uma subtarefa de outro Job.
*   **Políticas de Retentativa (`RetryPolicy`):** Define quantas vezes um Job deve ser tentado novamente em caso de falha e como o intervalo entre as tentativas deve aumentar (backoff).
*   **Timestamps:** Registros de quando o Job foi criado, atualizado, quando deve ser executado (`executeAfter`), iniciado, completado ou quando falhou.
*   **Resultado (`result`):** O produto final ou a conclusão do Job após a execução.

## Criando e Atribuindo Jobs

Normalmente, você criará e atribuirá Jobs através da interface do Project Wiz, em seções como "Tarefas" (seja na visão geral ou dentro de um projeto específico). O processo geralmente envolve:

1.  **Definir o Job:**
    *   Fornecer um **nome** claro e uma **descrição** detalhada da tarefa.
    *   Especificar o **payload inicial**, especialmente o **objetivo (`goal`)** que o Agente deve alcançar.
    *   Opcionalmente, definir critérios de aceitação ou o resultado esperado.
2.  **Selecionar o Papel do Agente Alvo:** Escolher qual **papel de Persona** (ex: `Developer`, `QA Tester`) é mais adequado para executar o Job. O sistema então o encaminhará para um Agente disponível com esse papel.
3.  **Definir Prioridade:** Indicar a urgência ou importância do Job.
4.  **Agendar ou Iniciar:** Optar por adicionar o Job à fila para ser pego por um Agente disponível, ou, se a funcionalidade permitir, tentar iniciá-lo imediatamente.

Os Agentes IA também podem criar Jobs para si mesmos (Sub-Jobs) usando ferramentas internas (como a `TaskManagerTool`) para decompor tarefas maiores em etapas menores e gerenciáveis.

## Ciclo de Vida e Processamento de Jobs

1.  **Enfileiramento:** Após a criação, um Job é colocado em uma "fila" conceitual (geralmente, um estado `PENDING` no banco de dados), aguardando um Agente compatível.
2.  **Seleção pelo Worker:** Um `WorkerService` (um processo de trabalho no backend) monitora a fila de Jobs para o papel de Agente que ele gerencia. Ele seleciona o próximo Job elegível (considerando prioridade, dependências e `executeAfter`).
3.  **Execução pelo Agente:** O Job é entregue a um `GenericAgentExecutor` (o "cérebro" do Agente), que utiliza o template da Persona, o LLM configurado, e suas ferramentas para processar o Job.
4.  **Atualização de Status:** Conforme o Agente trabalha, o status do Job é atualizado (ex: para `ACTIVE`). O Agente registra suas ações, pensamentos e uso de ferramentas no `ActivityContext` do Job.
5.  **Conclusão ou Falha:**
    *   Se bem-sucedido, o Job é marcado como `COMPLETED` e o resultado é armazenado.
    *   Se falhar, a política de retentativa é aplicada. Se todas as tentativas falharem, o Job é marcado como `FAILED`.
6.  **Jobs Atrasados e Dependentes:** Jobs com `executeAfter` no futuro ou com dependências não resolvidas permanecem em `DELAYED` ou `WAITING` até que suas condições sejam satisfeitas.

## Acompanhando o Progresso dos Jobs

Você poderá acompanhar o andamento dos Jobs através da interface do Project Wiz:

*   **Visualização de Status:** Listas de Jobs mostrarão o status atual de cada um.
*   **Logs de Execução:** Detalhes sobre os passos do Agente, decisões, e uso de ferramentas estarão disponíveis, ajudando a entender o processo.
*   **Resultados e Artefatos:** Produtos gerados (código, relatórios, etc.) estarão acessíveis após a conclusão.
*   *(Planejado)* **Notificações:** Alertas sobre mudanças importantes no status dos Jobs.

## O Papel das Ferramentas (Tools)

As Personas utilizam suas **Ferramentas** habilitadas para realizar o trabalho efetivo de um Job. Por exemplo:
*   Para um Job de "escrever código", a Persona pode usar ferramentas para ler/escrever arquivos, executar comandos no terminal (para linters, testes), etc.
*   Para um Job de "analisar um documento", a Persona pode usar ferramentas para buscar informações em memória, realizar buscas na web, ou anotar descobertas.

## Próximos Passos

*   **Personas e Agentes IA:** Certifique-se de que seus [Agentes](./03-personas-and-agents.md) estão configurados e prontos para o trabalho.
*   **Gerenciando Projetos:** Lembre-se que os Jobs geralmente operam dentro do contexto de um [Projeto](./02-projects.md).
*   **Visão Geral da Interface:** Localize as seções de gerenciamento de Tarefas/Jobs na [Interface do Usuário](../guides/02-interface-overview.md).

Este sistema de Jobs e automação é projetado para ser robusto e flexível, permitindo que o Project Wiz lide com uma ampla gama de tarefas de desenvolvimento de software de forma organizada e escalável.
