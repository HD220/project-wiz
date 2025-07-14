/**
 * Core abstractions module
 * Centralizes all core interfaces and types for the application
 */

// Repository abstractions
export { IRepository } from "./repository.interface";

// Service abstractions
export { IService, IBusinessService } from "./service.interface";

// Mapper abstractions
export { IMapper, IOptionalMapper } from "./mapper.interface";

// Validator abstractions
export {
  IValidator,
  ISchemaValidator,
  IValidationError,
} from "./validator.interface";

// CQRS abstractions
export {
  IQuery,
  IParameterizedQuery,
  IQueryHandler,
  IQueryBus,
} from "./query.interface";
export {
  ICommand,
  IParameterizedCommand,
  ICommandHandler,
  ICommandBus,
} from "./command.interface";

// Result type and utilities
export { Result, ISuccess, IError, ResultUtils } from "./result.type";

// Entity abstractions
export { IEntity, Entity, IAggregateRoot, AggregateRoot } from "./entity.type";

// Value object abstractions
export {
  IValueObject,
  ValueObject,
  PrimitiveValueObject,
} from "./value-object.type";

// Domain event abstractions
export {
  IDomainEvent,
  DomainEvent,
  IDomainEventHandler,
  IDomainEventBus,
  IEventStore,
} from "./domain-event.type";
