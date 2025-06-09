# Conceito Chave: ActivityContext

O `ActivityContext` é um componente fundamental no sistema de Agentes Autônomos, projetado para armazenar o estado e o contexto específico de uma **Activity** individual dentro de um **Job**. Ele reside no campo `data` da entidade `Job`, garantindo que cada Activity tenha seu próprio espaço isolado para gerenciar as informações relevantes para sua execução.

Enquanto o `AgentInternalState` representa o estado global e persistente de um Agente ao longo de múltiplos Jobs e Activities, o `ActivityContext` é efêmero e específico para a execução de uma única Activity. Ele contém todas as informações que o Large Language Model (LLM) precisa para raciocinar e tomar decisões focadas na tarefa atual, sem ser sobrecarregado pelo histórico completo do Agente ou de outros Jobs.

Os principais campos que compõem o `ActivityContext` incluem:

- `messageContent`: O conteúdo da mensagem ou instrução inicial para esta Activity.
- `sender`: Identifica a origem da mensagem (por exemplo, usuário, outro agente, sistema).
- `toolName`: O nome da ferramenta que está sendo utilizada ou que foi sugerida para uso nesta Activity.
- `toolArgs`: Os argumentos fornecidos para a execução da ferramenta.
- `goalToPlan`: O objetivo específico que o LLM deve alcançar nesta Activity, servindo como foco para o planejamento.
- `plannedSteps`: Uma lista dos passos planejados pelo LLM para atingir o `goalToPlan`.
- `activityNotes`: Notas ou observações relevantes geradas durante a execução da Activity.
- `validationCriteria`: Critérios usados para validar o resultado da Activity.
- `validationResult`: O resultado da validação da Activity.
- `activityHistory`: Um histórico das interações e resultados dentro desta Activity específica.

A importância do `ActivityContext` reside em sua capacidade de fornecer ao LLM um contexto conciso e relevante para a Activity em questão. Isso permite que o LLM mantenha o foco, execute raciocínios mais eficientes e produza resultados mais precisos para a tarefa atual.

Um desafio notável na gestão do `ActivityContext` é o potencial crescimento do campo `activityHistory`. Um histórico extenso pode consumir muitos tokens e impactar o desempenho e o custo das interações com o LLM. Estratégias como a sumarização do histórico são essenciais para mitigar esse problema, garantindo que o contexto seja mantido relevante e gerenciável, conforme abordado em discussões arquiteturais e considerações de implementação.
