import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { JobStatus, JobLogEntry } from '@/core/domain/job/job.entity';
import { IJobOptions } from '@/core/domain/job/value-objects/job-options.vo';

// Este schema é projetado para ser a versão final da tabela de jobs.
// A coluna 'dummyColumnToDelete' foi removida.
// Os tipos de dados foram revisados para corresponder à JobEntity.
// - payload: P (genérico) -> JSON
// - options: JobOptionsVO -> IJobOptions (raw) -> JSON
// - progress: number | object -> JSON
// - logs: JobLogEntry[] -> JSON
// - returnValue: R (genérico) -> JSON
// - stacktrace: string[] -> JSON
// - Datas (createdAt, updatedAt, etc.): Date -> integer (timestamp_ms)

export const jobsTable = sqliteTable(
  'jobs',
  {
    // Corresponde a JobIdVO.value (string)
    id: text('id').primaryKey(),
    // Corresponde a JobEntityProps.queueName (string)
    queueName: text('queue_name').notNull(),
    // Corresponde a JobEntityProps.name (string)
    name: text('name').notNull(),
    // Corresponde a JobEntityProps.payload (P). Serializado como JSON.
    payload: text('payload', { mode: 'json' }), // $type<P>() não é diretamente suportado por Drizzle para JSON genérico
    // Corresponde a JobEntityProps.options (JobOptionsVO). Serializado como IJobOptions (JSON).
    options: text('options', { mode: 'json' }).notNull().$type<IJobOptions>(),
    // Corresponde a JobEntityProps.status (JobStatus enum)
    status: text('status').notNull().$type<JobStatus>(),
    // Corresponde a JobEntityProps.attemptsMade (number)
    attemptsMade: integer('attempts_made').notNull().default(0),
    // Corresponde a JobEntityProps.progress (number | object). Serializado como JSON.
    progress: text('progress', { mode: 'json' }), // $type<number | object>() não é diretamente suportado
    // Corresponde a JobEntityProps.logs (JobLogEntry[]). Serializado como JSON.
    logs: text('logs', { mode: 'json' }).$type<JobLogEntry[]>(),
    // Corresponde a JobEntityProps.createdAt (Date). Armazenado como timestamp.
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    // Corresponde a JobEntityProps.updatedAt (Date). Armazenado como timestamp.
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
    // Corresponde a JobEntityProps.processedOn (Date | undefined). Armazenado como timestamp.
    processedOn: integer('processed_on', { mode: 'timestamp_ms' }),
    // Corresponde a JobEntityProps.finishedOn (Date | undefined). Armazenado como timestamp.
    finishedOn: integer('finished_on', { mode: 'timestamp_ms' }),
    // Corresponde a JobEntityProps.delayUntil (Date | undefined). Armazenado como timestamp.
    delayUntil: integer('delay_until', { mode: 'timestamp_ms' }),
    // Corresponde a JobEntityProps.lockUntil (Date | undefined). Armazenado como timestamp.
    lockUntil: integer('lock_until', { mode: 'timestamp_ms' }),
    // Corresponde a JobEntityProps.workerId (string | undefined)
    workerId: text('worker_id'),
    // Corresponde a JobEntityProps.returnValue (R). Serializado como JSON.
    returnValue: text('return_value', { mode: 'json' }), // $type<R>() não é diretamente suportado
    // Corresponde a JobEntityProps.failedReason (string | undefined)
    failedReason: text('failed_reason'),
    // Corresponde a JobEntityProps.stacktrace (string[] | undefined). Serializado como JSON.
    stacktrace: text('stacktrace', { mode: 'json' }).$type<string[]>(),
  },
  (table) => {
    return {
      queueNameIdx: index('jobs_queue_name_idx').on(table.queueName),
      statusIdx: index('jobs_status_idx').on(table.status),
      delayUntilIdx: index('jobs_delay_until_idx').on(table.delayUntil),
      // Índice composto para consultas comuns como "próximo job na fila X com status Y"
      queueStatusIdx: index('jobs_queue_status_idx').on(table.queueName, table.status),
      // Índice para encontrar jobs bloqueados por um worker específico (SQLite não suporta .where() em index desta forma)
      // A cláusula WHERE para índices parciais em SQLite é especificada no final da declaração CREATE INDEX.
      // Drizzle Kit pode não traduzir isso diretamente para todos os dialetos.
      // Para SQLite, um índice em uma coluna que pode ser NULL já é eficiente.
      // Se a filtragem por IS NOT NULL for crucial, ela será feita na query.
      // Vamos simplificar para compatibilidade e deixar a otimização da query lidar com isso.
      workerIdIdx: index('jobs_worker_id_idx').on(table.workerId),
      // Similarmente para lockUntil
      lockUntilIdx: index('jobs_lock_until_idx').on(table.lockUntil),
    };
  },
);
