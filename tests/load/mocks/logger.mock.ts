import { ILogger } from '../../../src/core/ports/logger/ilogger.interface';

export const mockLogger: ILogger = {
  debug: (message: string) => console.debug(`[DEBUG] ${message}`),
  info: (message: string) => console.info(`[INFO] ${message}`),
  warn: (message: string) => console.warn(`[WARN] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
};