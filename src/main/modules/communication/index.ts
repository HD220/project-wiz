import { CqrsDispatcher } from '@/main/kernel/cqrs-dispatcher';
import logger from '@/main/logger';

export function registerCommunicationModule(
  cqrsDispatcher: CqrsDispatcher,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  moduleLogger: typeof logger
): void {
  // TODO: Registrar commands e queries quando forem criados
  // TODO: Inicializar repositórios e serviços

  logger.info('Communication module registered');
}