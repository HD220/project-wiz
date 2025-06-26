# Tarefa: QSYS-1.4 - Definir Schema Drizzle e Gerar Migrações

**ID da Tarefa:** `QSYS-1.4`
**Título Breve:** Definir Schema Drizzle e Gerar Migrações
**Descrição Completa:**
Definir os schemas Drizzle para as tabelas do sistema de filas (`jobs`, `repeatable_job_schedules`, opcionalmente `job_dependencies`) em `src_refactored/infrastructure/persistence/drizzle/schema/`. Utilizar Drizzle Kit para gerar os arquivos de migração SQL correspondentes.

---

**Status:** `Bloqueado`
**Dependências (IDs):** `QSYS-1.1`
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P1`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/qsys-1.4-drizzle-schemas`
**Commit da Conclusão (Link):** `N/A (Tarefa bloqueada)`

---

## Critérios de Aceitação
- Arquivos de schema Drizzle (e.g., `jobs.table.ts`, `repeatable-job-schedules.table.ts`) criados conforme o design em `docs/technical-documentation/bullmq-inspired-queue-system.md` (Seção 3). **(Concluído parcialmente - Schemas definidos)**
- Todos os campos, tipos de dados, constraints (PKs, FKs se aplicável, not null) e índices potenciais definidos nos schemas. **(Concluído parcialmente - Schemas definidos)**
- Migrações SQL geradas usando Drizzle Kit (`npx drizzle-kit generate`). **(Bloqueado)**
- Migrações revisadas para garantir que refletem corretamente o schema desejado. **(Bloqueado)**

---

## Notas/Decisões de Design
- Certificar-se de que os tipos de dados Drizzle (`text`, `integer`, `blob`) e modos (`timestamp_ms`, `json`) estão corretamente mapeados para os tipos de dados da entidade `Job` e VOs.
- Considerar a estratégia para `dependsOnJobIds` (JSON blob na tabela `jobs` vs. tabela separada `job_dependencies`). A decisão inicial do design foi JSON blob.
- Definir índices apropriados para otimizar as consultas comuns (ver design doc).

---

## Comentários
- `(Data da migração por @Jules): Tarefa criada como parte do novo plano de implementação do sistema de filas.`
- `(2024-07-25 por @Jules): Status alterado para Bloqueado. Os schemas Drizzle para 'jobs' e 'repeatable_job_schedules' foram definidos/atualizados em 'src/infrastructure/services/drizzle/schemas/'. No entanto, a geração de migrações SQL via Drizzle Kit (`npm run db:generate`) está falhando com "Internal error occurred when running command". As definições de schema foram submetidas no branch 'feat/qsys-1.4-drizzle-schemas'.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
