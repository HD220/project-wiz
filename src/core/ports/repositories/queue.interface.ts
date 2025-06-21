import { IRepository } from "@/core/common/repository";
import { Queue } from "@/core/domain/entities/queue";

/**
 * Interface para repositórios de fila de jobs
 * Estende IRepository com operações específicas de fila
 */
export type IQueueRepository = IRepository<typeof Queue>;
