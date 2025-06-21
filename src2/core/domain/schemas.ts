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
  created_at: integer('created_at', { mode: 'timestamp_ms' }).$defaultFn(() => Date.now()),
  updated_at: integer('updated_at', { mode: 'timestamp_ms' }).$defaultFn(() => Date.now()),
});

export const jobsTable = sqliteTable('jobs', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()), // ID customizado pode vir de opts.jobId
  queue_name: text('queue_name').notNull(),
  name: text('name').notNull(), // Nome/tipo do Job (para o processador)
  data: text('data', { mode: 'json' }).notNull().$defaultFn(() => ({})), // Payload do Job (dados para o processador)
  opts: text('opts', { mode: 'json' }).notNull().$defaultFn(() => ({})), // Opções (attempts, delay, priority, backoff, jobId customizado)
  status: text('status', {
    enum: ['waiting', 'active', 'completed', 'failed', 'delayed', 'paused', 'waiting_children']
  }).notNull().default('waiting'),
  returnvalue: text('returnvalue', { mode: 'json' }), // Resultado do Job
  failedReason: text('failedReason'),                 // Mensagem de erro
  stacktrace: text('stacktrace', { mode: 'json' }),   // Stacktrace do erro (JSON array de strings)
  progress: text('progress', { mode: 'json' }),       // Progresso do Job (número ou objeto JSON)
  attemptsMade: integer('attemptsMade').notNull().default(0),
  delayUtil: integer('delayUtil', { mode: 'timestamp_ms' }), // Timestamp (ms) ATÉ quando o Job está em delay
  startedOn: integer('startedOn', { mode: 'timestamp_ms' }), // Quando o processamento foi iniciado (ou última tentativa)
  processedOn: integer('processedOn', { mode: 'timestamp_ms' }), // Quando a última tentativa de processamento finalizou
  finishedOn: integer('finishedOn', { mode: 'timestamp_ms' }),  // Quando o Job foi concluído (completed/failed final)

  created_at: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => Date.now()),
  updated_at: integer('updated_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => Date.now()),
});

// Relações - BullMQ não usa FKs diretas para dependências de Job, geralmente é lógico.
// Vamos remover a auto-referência de parent_job_id por enquanto para simplificar e alinhar
// com a ideia de que dependências (incluindo a lógica de 'waiting_children') são gerenciadas
// pelo QueueService/Worker com base nos dados em 'opts' ou 'data'.
export const projectRelations = relations(projectsTable, ({ many }) => ({
  // A associação de Jobs a Projetos agora é lógica, possivelmente através de um project_id no campo 'data' de um Job.
}));

export const jobRelations = relations(jobsTable, ({ one, many }) => ({
  // Se precisarmos de hierarquia explícita no DB, parent_job_id seria adicionado de volta.
  // Por ora, a lógica de Sub-Job/parentesco pode ser gerenciada no `data` ou `opts` do Job.
}));

// Tipos Zod para as opções de Job (opts)
export const jobOptionsSchema = z.object({
  priority: z.number().optional(),
  attempts: z.number().min(1).optional(), // Máximo de tentativas
  delay: z.number().min(0).optional(), // Delay inicial em ms
  backoff: z.union([
    z.number(), // Delay fixo para backoff
    z.object({
      type: z.enum(['fixed', 'exponential']),
      delay: z.number().min(1),
    })
  ]).optional(),
  lifo: z.boolean().optional(),
  jobId: z.string().optional(), // ID customizado do Job (se fornecido, sobrescreve o UUID)
  // Opção para armazenar IDs de jobs dos quais este job depende (para moveToWaitingChildren)
  parent: z.object({
    id: z.string(),
    queue: z.string(), // Nome da fila do job pai (BullMQ chama de "prefix")
  }).optional(),
  // Para a lógica de `waiting-children`, podemos ter um array de children job keys
  // children: z.array(z.object({id: z.string(), queue: z.string()})).optional(),
}).deepPartial().optional(); // deepPartial para tornar todos os campos internos opcionais também

// Tipos para seleção
export type Project = typeof projectsTable.$inferSelect;
export type Job = typeof jobsTable.$inferSelect;
export type JobOptions = z.infer<typeof jobOptionsSchema>; // Tipo para as opções

// Tipos para inserção
export type NewProject = typeof projectsTable.$inferInsert;
export type NewJob = Omit<typeof jobsTable.$inferInsert, 'opts' | 'data'> & {
  opts?: JobOptions; // Permite que opts seja um objeto estruturado
  data?: Record<string, any>; // Permite que data seja um objeto estruturado
};

// Schemas Zod para validação
export const insertProjectSchema = createInsertSchema(projectsTable);
export const selectProjectSchema = createSelectSchema(projectsTable);

export const insertJobSchema = createInsertSchema(jobsTable, {
  // Campos JSON precisam de `z.string().transform()` ou `z.any()` se não tiver schema estrito
  data: z.record(z.string(), z.any()).optional().default({}), // Objeto JSON arbitrário
  opts: jobOptionsSchema.default({}), // Aplicar schema Zod para opts
  returnvalue: z.any().optional().nullable(),
  failedReason: z.string().optional().nullable(),
  stacktrace: z.array(z.string()).optional().nullable(), // Array de strings
  progress: z.any().optional().nullable(), // Pode ser número ou objeto
  delayUtil: z.number().optional().nullable(),
  startedOn: z.number().optional().nullable(),
  processedOn: z.number().optional().nullable(),
  finishedOn: z.number().optional().nullable(),
  // created_at e updated_at têm defaults no DB, mas podem ser incluídos se necessário
  // $defaultFn no Drizzle só funciona no insert, não no update.
  // Para Zod, se quiser garantir que sejam strings no input, precisaria de transform.
  // Mas como são datas, o Drizzle vai lidar com a conversão para número.
}).omit({
  // Omitir campos que têm $defaultFn e não queremos que sejam obrigatórios no input,
  // a menos que queiramos permitir sobrescrevê-los.
  // id: true, // Já é omitido por createInsertSchema se tem $defaultFn
  // created_at: true,
  // updated_at: true,
});

export const selectJobSchema = createSelectSchema(jobsTable, {
  data: z.record(z.string(), z.any()).optional().nullable(),
  opts: jobOptionsSchema.nullable(),
  returnvalue: z.any().optional().nullable(),
  stacktrace: z.array(z.string()).optional().nullable(),
  progress: z.any().optional().nullable(),
  delayUtil: z.number().optional().nullable(),
  startedOn: z.number().optional().nullable(),
  processedOn: z.number().optional().nullable(),
  finishedOn: z.number().optional().nullable(),
});

// Tipo NewJob ajustado para uso no código da aplicação, garantindo que opts e data sejam objetos
export type AppNewJob = Omit<NewJob, 'opts' | 'data'> & {
  opts?: JobOptions;
  data: Record<string, any>; // Data é sempre um objeto, mesmo que vazio
};
