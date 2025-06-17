# Sub-tarefa: Verificar dependências das Tasks da Aplicação

## Descrição:

Revisar as implementações das Tasks concretas (`CallToolTask`, `LLMReasoningTask`, e outras Tasks iniciais) para garantir que suas dependências estejam corretas e sigam os princípios da Clean Architecture.

## Contexto:

As Tasks na camada de Aplicação devem depender apenas das interfaces (Ports) definidas no Domínio ou na própria camada de Aplicação (como interfaces de Tools ou LLMs). É crucial garantir que as Tasks implementadas não tenham dependências diretas de implementações concretas da camada de Infraestrutura ou de outros componentes de orquestração (como `Queue`, `Worker` ou `AutonomousAgent`).

## Specific Instructions:

1. Abra os arquivos das Tasks implementadas: `src/core/application/tasks/call-tool.task.ts`, `src/core/application/tasks/llm-reasoning.task.ts`, e quaisquer outros arquivos de Task criados na sub-tarefa 07.03.
2. Para cada Task, revise as injeções de dependência em seus construtores.
3. Verifique se todas as dependências são interfaces (Ports) definidas nas camadas de Domínio ou Aplicação (ex: `ToolInterface`, `LLMInterface`).
4. Garanta que não há importações diretas ou referências a classes concretas da camada de Infraestrutura (ex: adapters específicos) ou a componentes de orquestração (`QueueService`, `WorkerPool`, `AutonomousAgent`).
5. Se encontrar alguma dependência incorreta, identifique a interface apropriada na camada de Domínio/Aplicação que deve ser utilizada em seu lugar.
6. Adicione comentários no código explicando as dependências injetadas.
7. Não crie testes nesta fase.

## Expected Deliverable:

Os arquivos das Tasks da Aplicação revisados, com as dependências verificadas para garantir a aderência aos princípios da Clean Architecture.