import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { randomUUID } from 'crypto';

export const projectsTable = sqliteTable('projects', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  caminho_working_directory: text('caminho_working_directory').notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const jobsTable = sqliteTable('jobs', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  name: text('name'),
  // project_id REMOVIDO
  persona_id: text('persona_id'),
  status: text('status', { enum: ['pending', 'executing', 'completed', 'failed', 'delayed', 'waiting_dependency'] }).notNull().default('pending'),
  priority: integer('priority').default(0),
  payload: text('payload', { mode: 'json' }),
  data: text('data', { mode: 'json' }), // Para ActivityContext. O ID do projeto pode estar aqui se necessário para o Job.
  result: text('result', { mode: 'json' }),
  attempts: integer('attempts').default(0),
  max_attempts: integer('max_attempts').default(3),
  delay_ms: integer('delay_ms').default(0),
  retry_delay_base_ms: integer('retry_delay_base_ms').default(1000),
  depends_on_job_ids: text('depends_on_job_ids', { mode: 'json' }),
  parent_job_id: text('parent_job_id').references(() => jobsTable.id),
  created_at: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  started_at: integer('started_at', { mode: 'timestamp' }),
  completed_at: integer('completed_at', { mode: 'timestamp' }),
  failed_reason: text('failed_reason'),
});

// Relações
export const projectRelations = relations(projectsTable, ({ many }) => ({
  // A relação explícita de Project -> Jobs foi removida ao remover jobsTable.project_id
  // Se for necessário listar Jobs de um projeto, será por uma query que filtre pelo project_id
  // armazenado no payload/data do Job, ou por uma tabela de junção se a relação M:N for desejada.
  // Por ora, vamos manter simples e a relação é lógica.
}));

export const jobRelations = relations(jobsTable, ({ one, many }) => ({
  // Relação com project removida
  parentJob: one(jobsTable, {
    fields: [jobsTable.parent_job_id],
    references: [jobsTable.id],
    relationName: 'parent_child_jobs',
  }),
  subJobs: many(jobsTable, {
    relationName: 'parent_child_jobs',
  }),
}));

// Tipos para seleção (ex: retorno de queries) - $inferSelect
export type Project = typeof projectsTable.$inferSelect;
export type Job = typeof jobsTable.$inferSelect; // Agora não terá project_id

// Tipos para inserção (ex: entrada para criar novo) - $inferInsert
export type NewProject = typeof projectsTable.$inferInsert;
export type NewJob = typeof jobsTable.$inferInsert; // Agora não terá project_id

// Schemas Zod para validação em tempo de execução
export const insertProjectSchema = createInsertSchema(projectsTable);
export const selectProjectSchema = createSelectSchema(projectsTable);

export const insertJobSchema = createInsertSchema(jobsTable, {
  // project_id removido
  name: z.string().min(1, { message: "Job name cannot be empty" }).optional().nullable(),
  persona_id: z.string().optional().nullable(),
  payload: z.any().optional().nullable(),
  data: z.any().optional().nullable(),
  result: z.any().optional().nullable(),
  depends_on_job_ids: z.array(z.string().uuid()).optional().nullable(),
  parent_job_id: z.string().uuid().optional().nullable(),
});

export const selectJobSchema = createSelectSchema(jobsTable, {
  // project_id removido
  name: z.string().optional().nullable(),
  persona_id: z.string().optional().nullable(),
  payload: z.any().optional().nullable(),
  data: z.any().optional().nullable(),
  result: z.any().optional().nullable(),
  depends_on_job_ids: z.array(z.string().uuid()).optional().nullable(),
  parent_job_id: z.string().uuid().optional().nullable(),
});
