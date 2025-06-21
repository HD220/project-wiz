# Sub-tarefa: Implementar gerenciamento de histórico de atividades no AutonomousAgent

## Descrição:

Implementar a lógica para gerenciar o histórico de atividades (`activityHistory`) dentro do `AutonomousAgent`, incluindo a adição de novas entradas e, futuramente, a lógica de sumarização/truncamento conforme o ADR 003.

## Contexto:

O `activityHistory` dentro do `ActivityContext` registra os passos e resultados das iterações anteriores do agente para uma determinada atividade. Gerenciar este histórico é crucial para que o agente tenha memória e possa construir sobre o trabalho anterior. Para evitar que o histórico se torne excessivamente longo e consuma muitos tokens do LLM, uma lógica de sumarização ou truncamento será necessária (conforme ADR 003).

## Specific Instructions:

1. Abra o arquivo da classe `AutonomousAgent` (`src/core/application/services/autonomous-agent.service.ts`).
2. Dentro do método `processActivity`, adicione a lógica para adicionar uma nova entrada ao `activityHistory` após cada iteração do loop de raciocínio. A nova entrada deve registrar a ação tomada pelo agente e seu resultado.
3. Utilize os métodos apropriados do Value Object `ActivityHistory` para adicionar novas entradas de forma imutável.
4. Adicione um placeholder ou uma implementação básica inicial para a lógica de gerenciamento do histórico grande (sumarização/truncamento) conforme o ADR 003. Esta lógica pode ser refinada em uma sub-tarefa posterior.
5. Certifique-se de que o `ActivityContext` atualizado com o novo histórico seja persistido (isso deve ser tratado pela lógica de atualização de contexto implementada na sub-tarefa 05.05).
6. Adicione comentários no código explicando a lógica de gerenciamento do histórico.
7. Não crie testes nesta fase.

## Expected Deliverable:

Arquivo `src/core/application/services/autonomous-agent.service.ts` com a lógica de adição de novas entradas ao `activityHistory` e um placeholder/implementação básica para o gerenciamento do histórico grande.