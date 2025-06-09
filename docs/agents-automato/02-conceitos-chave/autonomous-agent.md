# Conceito Chave: AutonomousAgent

O `AutonomousAgent` é a classe central e controladora no sistema de agentes autônomos. Ele é o responsável por implementar o "Loop Agente", que é o coração do raciocínio, da tomada de decisões e da orquestração das atividades no `project-wiz`. Pense nele como o "cérebro" do agente de IA.

Sua operação é contínua e orientada a atividades. Ele não segue um fluxo pré-definido rígido, mas sim processa dinamicamente um backlog de atividades, decidindo a cada momento qual é a mais relevante para focar.

As principais responsabilidades do `AutonomousAgent` incluem:

- **Raciocínio e Tomada de Decisão:** Utilizando um Large Language Model (LLM), o `AutonomousAgent` raciocina sobre a próxima ação a ser tomada. Este raciocínio é baseado em dois contextos principais: o `AgentInternalState` (estado global de negócio do agente, como projeto atual, meta geral) e o `ActivityContext` da atividade que está sendo processada (contexto específico da tarefa, incluindo histórico de conversa e notas).
- **Gerenciamento de Activities:** O Agente interage com a `Queue` (através de um `QueueService` ou `JobRepository`) para obter as `Jobs` que representam as `Activities` a serem processadas. Ele também atualiza o `ActivityContext` dentro da `Job` com o progresso, resultados e reflexões.
- **Despacho de Tasks:** Quando o raciocínio do LLM indica que uma ação concreta precisa ser executada (como usar uma ferramenta ou enviar uma mensagem), o `AutonomousAgent` não executa essa ação diretamente. Em vez disso, ele utiliza uma interface (`IAgentService`) para despachar a execução da `Task` correspondente.
- **Gerenciamento de Estado Interno:** O Agente atualiza seu `AgentInternalState` com informações relevantes que surgem durante o processamento das atividades, mantendo um contexto de negócio de alto nível persistente.

O `AutonomousAgent` é invocado por um `Worker`. Quando um `Worker` obtém uma `Job` (Activity) da `Queue`, ele passa essa `Job` para o `AutonomousAgent` processar. O Agente, então, executa uma iteração do seu loop de raciocínio, possivelmente despachando `Tasks` e atualizando o estado da `Job`.

A decisão sobre a próxima ação é o resultado do raciocínio do LLM, que analisa o estado interno do agente e o contexto específico da atividade para determinar o passo mais lógico e eficaz para avançar em direção ao objetivo da atividade.
