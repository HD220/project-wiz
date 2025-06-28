# ADR 002: Distinção entre AgentInternalState e Activity Context

- **Título:** Distinção clara entre AgentInternalState e Activity Context.
- **Status:** Aceito.
- **Contexto:** O Agente Autônomo precisa manter um estado global de negócio (ex: projeto atual, meta geral) e, ao mesmo tempo, raciocinar sobre o contexto específico da Activity que está processando (histórico daquela tarefa, notas relevantes apenas para ela). Misturar esses contextos levaria a prompts de LLM excessivamente longos e confusão no raciocínio do Agente.
- **Decisão:** Será mantida uma distinção clara entre o `AgentInternalState` (estado global de negócio do Agente, persistido separadamente) e o `ActivityContext` (contexto específico de uma Activity, armazenado em `Job.data`). O LLM receberá ambos os contextos, mas será instruído a focar no `ActivityContext` para o raciocínio sobre a tarefa atual, usando o `AgentInternalState` como contexto de alto nível.
- **Consequências:**
  - Melhora a clareza e a relevância do contexto fornecido ao LLM, levando a um raciocínio mais focado e eficiente.
  - Reduz o tamanho dos prompts do LLM ao isolar o histórico de conversa por Activity.
  - Requer mecanismos separados para persistir e carregar o `AgentInternalState` e o `ActivityContext`.
  - O `AutonomousAgent` deve gerenciar corretamente a passagem desses dois contextos para o LLM.
