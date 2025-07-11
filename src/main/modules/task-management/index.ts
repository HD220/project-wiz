import { CqrsDispatcher } from '@/main/kernel/cqrs-dispatcher';
import logger from '@/main/logger';
import { TaskQueueServiceImpl } from './application/services/task-queue.service';
import { DrizzleTaskRepository } from './persistence/drizzle-task.repository';
import { initializeDb } from '@/main/persistence/db';

export function registerTaskManagementModule(
  cqrsDispatcher: CqrsDispatcher,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  moduleLogger: typeof logger
): void {
  // TODO: Registrar commands e queries quando forem criados
  // TODO: Inicializar repositórios e serviços

  logger.info('Task Management module registered');
}