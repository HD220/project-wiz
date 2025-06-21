import { ILogger } from "../../src/core/ports/logger/ilogger.interface";

export const mockLogger: ILogger = {
  info: (message: string, context?: Record<string, unknown>) => {},
  warn: (message: string, context?: Record<string, unknown>) => {},
  error: (message: string, context?: Record<string, unknown>) => {},
  debug: (message: string, context?: Record<string, unknown>) => {},
};
