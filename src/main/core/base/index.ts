/**
 * Core base classes module
 * Centralizes all base class exports for the application
 */

// Entity base class
export { BaseEntity } from "./base-entity";

// Value object base class
export { BaseValueObject } from "./base-value-object";

// Repository base class
export { BaseRepository } from "./base-repository";

// Service base class
export { BaseService } from "./base-service";

// Mapper base class
export { BaseMapper } from "./base-mapper";

// Validator base class and related types
export { BaseValidator, ValidationError } from "./base-validator";

// IPC handler base class and related types
export {
  BaseIpcHandler,
  IpcRequestContext,
  IpcResponse,
} from "./base-ipc-handler";
