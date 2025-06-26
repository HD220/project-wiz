# Tarefa: QSYS-1.4 - Definir Schema Drizzle e Gerar Migrações

**ID da Tarefa:** `QSYS-1.4`
**Título Breve:** Definir Schema Drizzle e Gerar Migrações
**Descrição Completa:**
Definir os schemas Drizzle para as tabelas do sistema de filas (`jobs`, `repeatable_job_schedules`, opcionalmente `job_dependencies`) em `src_refactored/infrastructure/persistence/drizzle/schema/`. Utilizar Drizzle Kit para gerar os arquivos de migração SQL correspondentes.

---

**Status:** `Pendente`
**Dependências (IDs):** `QSYS-1.1`
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P1`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/qsys-1.4-drizzle-schema-migrations`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Arquivos de schema Drizzle (e.g., `jobs.table.ts`, `repeatable-job-schedules.table.ts`) criados conforme o design em `docs/technical-documentation/bullmq-inspired-queue-system.md` (Seção 3).
- Todos os campos, tipos de dados, constraints (PKs, FKs se aplicável, not null) e índices potenciais definidos nos schemas.
- Migrações SQL geradas usando Drizzle Kit (`npx drizzle-kit generate`).
- Migrações revisadas para garantir que refletem corretamente o schema desejado.

---

## Notas/Decisões de Design
- Certificar-se de que os tipos de dados Drizzle (`text`, `integer`, `blob`) e modos (`timestamp_ms`, `json`) estão corretamente mapeados para os tipos de dados da entidade `Job` e VOs.
- Considerar a estratégia para `dependsOnJobIds` (JSON blob na tabela `jobs` vs. tabela separada `job_dependencies`). A decisão inicial do design foi JSON blob.
- Definir índices apropriados para otimizar as consultas comuns (ver design doc).

---

## Comentários
- `(YYYY-MM-DD por @Jules): Tarefa criada como parte do novo plano de implementação do sistema de filas.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
