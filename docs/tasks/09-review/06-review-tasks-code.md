# Sub-tarefa: Revisar código da camada de Aplicação - Tasks

## Descrição:

Realizar uma revisão completa do código implementado na camada de Aplicação relacionado às Tasks concretas para garantir a aderência rigorosa aos princípios da Clean Architecture e Object Calisthenics.

## Contexto:

As Tasks são as unidades de execução acionáveis do agente. É crucial garantir que o código de cada Task seja focado em uma única responsabilidade, dependa apenas de interfaces e aplique rigorosamente os princípios de Object Calisthenics para manter a lógica das Tasks clara e manutenível.

## Specific Instructions:

1. Abra todos os arquivos de código na pasta `src/core/application/tasks/`.
2. Para cada classe de Task, verifique a aderência aos princípios de Object Calisthenics (conforme lista na sub-tarefa 09.01).
3. Verifique se as Tasks implementam corretamente a interface base `Task`.
4. Garanta que as Tasks dependam apenas de interfaces (Ports) definidas no Domínio ou na própria camada de Aplicação (como interfaces de Tools ou LLMs).
5. Confirme que as Tasks não têm conhecimento direto de componentes de orquestração (`Queue`, `Worker`, `AutonomousAgent`).
6. Verifique se a lógica de cada Task é focada em uma única responsabilidade.
7. Identifique quaisquer áreas onde o design pode ser simplificado ou melhorado.
8. Refatore o código conforme necessário para corrigir violações dos princípios ou melhorar o design.
9. Adicione comentários no código apenas onde a lógica for complexa e não puder ser simplificada.
10. Não crie testes nesta fase.

## Expected Deliverable:

Código-source da camada de Aplicação - Tasks revisado e refinado, com alta aderência aos princípios da Clean Architecture e Object Calisthenics.