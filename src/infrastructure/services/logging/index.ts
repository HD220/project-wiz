// src/infrastructure/services/logging/index.ts

import { ConsoleLogger } from './console-logger.service';
import { ILogger } from '../../../core/ports/services/logger.interface';

/**
 * Default application logger instance.
 * For now, this is a ConsoleLogger. In the future, this could be configured
 * to use different logger implementations based on environment or configuration.
 */
export const logger: ILogger = new ConsoleLogger();

// Optional: A factory function if more complex creation or different logger types
// (e.g., per module with specific context) are needed later.
// export function createLogger(moduleName?: string): ILogger {
//   // const loggerInstance = new ConsoleLogger();
//   // if (moduleName && loggerInstance.setModule) { // If logger supports module context
//   //   loggerInstance.setModule(moduleName);
//   // }
//   // return loggerInstance;
//   return new ConsoleLogger(); // Simplified for now
// }
