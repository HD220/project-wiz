# ADR 007: Processamento de Job/Activity Orquestrado pelo AutonomousAgent

- **Título:** AutonomousAgent como orquestrador primário do processamento de uma Job/Activity.
- **Status:** Aceito.
- **Contexto:** Era necessário definir claramente qual componente seria o responsável principal por conduzir o processamento de uma única unidade de trabalho (Job/Activity) após ela ser retirada da Queue por um Worker.
- **Decisão:** O `AutonomousAgent` será o orquestrador primário do processamento de uma `Job`/`Activity` individual. O `Worker` terá a responsabilidade de obter a `Job` da `Queue` e entregá-la ao `AutonomousAgent` (via um método como `processActivity`), e então notificar a `Queue` com base no resultado retornado pelo Agente. O loop de raciocínio, a decisão sobre qual Task executar, a atualização do `ActivityContext` e a decisão sobre se a Activity está completa para o ciclo ocorrerão dentro do `AutonomousAgent`.
- **Consequências:**
  - Centraliza a lógica de raciocínio e orquestração de uma Activity no Agente, alinhado com o design orientado a atividades.
  - Mantém o Worker relativamente simples, focado em obter a Job e gerenciar a comunicação com a Queue.
  - Requer que o `AutonomousAgent` seja capaz de receber a entidade `Job` completa e interagir com os serviços/adapters necessários (LLM, IAgentService).
  - A lógica de retorno do `AutonomousAgent` para o Worker (resultado final, `undefined` para re-agendar, exceção para falha) deve ser clara e consistente.
