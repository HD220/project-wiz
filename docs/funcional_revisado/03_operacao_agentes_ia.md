# Operação de Agentes IA

Os Agentes de IA (configurados por Personas) no Project Wiz operam de forma autônoma para analisar solicitações, planejar e executar tarefas (Jobs).

## Ciclo de Operação e Capacidades:

1.  **Análise da Solicitação do Usuário:**
    *   Quando um usuário interage com um Agente (via chat), o Agente utiliza seu LLM configurado (pela Persona) para interpretar a necessidade e o objetivo do usuário.
    *   Esta análise considera o `AgentInternalState` da Persona para contexto adicional.

2.  **Criação e Planejamento de Jobs:**
    *   Com base na análise, o Agente decide se e como um ou mais Jobs devem ser criados para atender à solicitação.
    *   **Criação de Job Principal:** O Agente formula um Job principal que encapsula o objetivo geral da solicitação do usuário, adicionando-o à sua própria fila nomeada (`queueName`).
    *   **Definição de "Pronto" (`validationCriteria`):** Antes de iniciar a execução detalhada, o Agente define critérios claros de validação (a "Definição de Pronto") para o Job principal. Isso estabelece as condições de sucesso.
    *   **Planejamento Detalhado e Decomposição (Sub-Jobs):**
        *   Utilizando o LLM, o Agente pode decompor o Job principal em uma sequência de Sub-Jobs menores e mais gerenciáveis. Esta é uma capacidade emergente da inteligência do Agente, suportada pelo sistema de Jobs que permite a criação de Jobs com dependências.
        *   Cada Sub-Job é também um Job adicionado à fila do Agente, com dependências definidas em relação a outros Sub-Jobs ou ao Job principal.
        *   Sub-Jobs também podem ter seus próprios `validationCriteria`, definidos como parte da estratégia de planejamento do Agente.
    *   **Ponto de Verificação com Usuário:** O Agente pode apresentar seu plano de Jobs/Sub-Jobs e a "Definição de Pronto" ao usuário para aprovação antes de prosseguir com a execução. Esta interação é facilitada por `Tools` de comunicação.
    *   *Nota sobre Padrões Avançados:* A capacidade de decompor tarefas complexas, definir critérios de pronto detalhados e realizar auto-validação são primariamente estratégias operacionais conduzidas pela inteligência do LLM da Persona, utilizando as capacidades fundamentais do sistema de Jobs (como dependências) e `Tools`. Não são, em si, funcionalidades explicitamente codificadas no framework como casos de uso distintos de "Decompor Job" ou "Validar Job".

3.  **Execução de Jobs e Sub-Jobs:**
    *   O Agente processa Jobs de sua fila um de cada vez (ou conforme a lógica do Worker Pool).
    *   Para cada Job/Sub-Job, o Agente:
        *   Carrega o `ActivityContext` relevante (se já existe) ou inicializa um novo.
        *   Utiliza seu LLM para determinar os próximos passos ou ações.
        *   Solicita a execução de `Tools` específicas (do `ToolRegistry`) conforme decidido pelo LLM.
        *   Atualiza o `ActivityContext` com resultados das `Tools`, respostas do LLM, notas e progresso.
    *   **Operação em Ambiente Controlado:** Para tarefas de código, o Agente opera dentro da `working_directory` do projeto, utilizando um branch Git específico para isolar as alterações do Job/Sub-Job.

4.  **Gerenciamento de Contexto (`ActivityContext`):**
    *   Cada Job ativo possui um `ActivityContext` que armazena:
        *   A descrição da tarefa, dados de entrada.
        *   O histórico completo de interações com o LLM e `Tools` para aquele Job.
        *   Notas e observações geradas pelo Agente durante a execução.
        *   Os `validationCriteria` definidos para o Job.
        *   O `validationResult` após a tentativa de conclusão.
    *   Este contexto é usado para todas as interações subsequentes do LLM relacionadas ao mesmo Job, garantindo continuidade.

5.  **Auto-Validação:**
    *   Ao final da execução de um Job ou Sub-Job, o Agente realiza uma auto-validação, comparando o resultado obtido com os `validationCriteria` definidos.
    *   Isso pode envolver uma consulta específica ao LLM para avaliar a qualidade ou completude do trabalho.
    *   Se a validação falhar, o Agente pode tentar corrigir o trabalho, replanejar ou, em último caso, escalar para o usuário.

6.  **Atualização do `AgentInternalState` (Aprendizado):**
    *   Após a conclusão de Jobs, o Agente pode promover informações relevantes, aprendizados, ou soluções bem-sucedidas do `ActivityContext` para seu `AgentInternalState` (memória de longo prazo).
    *   Isso permite que o Agente melhore seu desempenho em tarefas futuras.

7.  **Comunicação e Colaboração (Intenção Futura/Avançada):**
    *   Agentes podem usar `Tools` de comunicação para:
        *   Enviar mensagens e atualizações para o usuário.
        *   Interagir com outros Agentes, solicitando informações ou delegando Sub-Jobs.

8.  **Tratamento de Erros e Resiliência:**
    *   Agentes devem ser capazes de lidar com erros na execução de `Tools` ou respostas inesperadas do LLM.
    *   O sistema de Jobs suporta retentativas para falhas transitórias.
    *   Em caso de dificuldades persistentes, o Agente pode pausar o Job e solicitar intervenção do usuário.
