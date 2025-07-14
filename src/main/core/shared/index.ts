/**
 * Core shared utilities module
 * Centralizes all shared utility exports for the application
 */

// Logger utility and related types
export {
  Logger,
  ChildLogger,
  LogLevel,
  LogEntry,
  LoggerConfig,
  logger,
} from "./logger";

// Date utilities and related types
export {
  DateUtils,
  TimeUnits,
  DateFormatOptions,
  Duration,
} from "./date-utils";

// Validation utilities and related types
export { ValidationUtils, ValidationResult } from "./validation-utils";

// String utilities and related types
export {
  StringUtils,
  CaseTransform,
  TruncateOptions,
  SlugOptions,
} from "./string-utils";
