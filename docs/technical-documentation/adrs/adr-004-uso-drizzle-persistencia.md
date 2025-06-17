# ADR 004: Uso de Drizzle ORM para Persistência

- **Título:** Utilização de Drizzle ORM com SQLite para persistência.
- **Status:** Aceito.
- **Contexto:** O projeto já utiliza Drizzle ORM e SQLite para persistência. Manter essa escolha para o sistema de Agentes, Workers e Queues garante consistência tecnológica e aproveita o conhecimento existente na equipe.
- **Decisão:** A persistência das entidades `Job`/`Activity` e `AgentInternalState` será implementada utilizando Drizzle ORM com SQLite. Os repositórios na camada de Infraestrutura serão responsáveis por mapear as entidades do Domínio para os schemas do Drizzle e interagir com o banco de dados.
- **Consequências:**
  - Consistência com a stack tecnológica existente.
  - Aproveitamento do conhecimento da equipe em Drizzle e SQLite.
  - Requer a definição de schemas Drizzle para as novas entidades/estruturas (`Job` com `data` JSON, `AgentInternalState`).
  - A performance e escalabilidade do SQLite devem ser monitoradas conforme o volume de Jobs/Activities aumenta.
