# ADR 001: Unificação de Job e Activity

- **Título:** Unificação das entidades Job e Activity.
- **Status:** Aceito.
- **Contexto:** O sistema existente possuía uma entidade `Job` para processamento assíncrono, enquanto o novo design de Agentes Autônomos introduziu o conceito de `Activity` como a unidade de trabalho do Agente com contexto e histórico próprios. Era necessário harmonizar esses conceitos para evitar duplicação e complexidade.
- **Decisão:** A entidade `Job` existente será estendida e enriquecida para atuar como a representação persistida de uma `Activity`. O contexto específico da Activity (`activityHistory`, `activityNotes`, `plannedSteps`, etc.) será armazenado em um objeto dentro do campo `data` da entidade `Job`.
- **Consequências:**
  - Simplifica o modelo de dados ao ter uma única entidade persistida (`Job`) para representar as unidades de trabalho do sistema assíncrono e dos Agentes.
  - Permite que a infraestrutura de Queue e Workers existente (com adaptações) gerencie o ciclo de vida das Activities do Agente.
  - Requer adaptações na lógica da Queue e dos Workers para lidar com o novo `ActivityContext` dentro de `Job.data`.
  - O `AutonomousAgent` precisará carregar e salvar o `ActivityContext` corretamente ao processar uma `Job`.
