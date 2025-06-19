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
  project_id: text('project_id').notNull().references(() => projectsTable.id),
  persona_id: text('persona_id'), // Pode ser um ID de configuração de Persona
  status: text('status', { enum: ['pending', 'executing', 'completed', 'failed', 'delayed', 'waiting_dependency'] }).notNull().default('pending'),
  priority: integer('priority').default(0),

  payload: text('payload', { mode: 'json' }), // Dados de entrada para o Job
  data: text('data', { mode: 'json' }),       // Para armazenar ActivityContext
  result: text('result', { mode: 'json' }),   // Resultado do Job

  attempts: integer('attempts').default(0),
  max_attempts: integer('max_attempts').default(3),
  // Em vez de delay_ms absoluto, vamos usar 'delayed_until' timestamp
  // ou manter delay_ms como duração e calcular o 'available_at' no serviço.
  // Por ora, delay_ms será a DURAÇÃO do delay. O QueueService usará updated_at + delay_ms para saber quando está disponível.
  delay_ms: integer('delay_ms').default(0),
  retry_delay_base_ms: integer('retry_delay_base_ms').default(1000), // Base para backoff exponencial

  depends_on_job_ids: text('depends_on_job_ids', { mode: 'json' }), // JSON array de strings (Job IDs)
  parent_job_id: text('parent_job_id').references(() => jobsTable.id), // Auto-referência para Sub-Jobs

  created_at: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  started_at: integer('started_at', { mode: 'timestamp' }),
  completed_at: integer('completed_at', { mode: 'timestamp' }),
  failed_reason: text('failed_reason'),
});

// Relações (opcional aqui, mas bom para ORM)
export const projectRelations = relations(projectsTable, ({ many }) => ({
  jobs: many(jobsTable),
}));

export const jobRelations = relations(jobsTable, ({ one, many }) => ({
  project: one(projectsTable, {
    fields: [jobsTable.project_id],
    references: [projectsTable.id],
  }),
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
export type Job = typeof jobsTable.$inferSelect;

// Tipos para inserção (ex: entrada para criar novo) - $inferInsert
export type NewProject = typeof projectsTable.$inferInsert;
export type NewJob = typeof jobsTable.$inferInsert;

// Schemas Zod para validação em tempo de execução (recomendado)
export const insertProjectSchema = createInsertSchema(projectsTable);
export const selectProjectSchema = createSelectSchema(projectsTable);

export const insertJobSchema = createInsertSchema(jobsTable, {
  // Exemplo de refinamento com Zod:
  // priority: z.number().min(0).max(10),
  // payload: z.object({ /* ... estrutura do payload ... */ }),
});
export const selectJobSchema = createSelectSchema(jobsTable);
