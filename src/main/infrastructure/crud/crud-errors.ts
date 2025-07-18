export class EntityNotFoundError extends Error {
  constructor(entityName: string, id: string) {
    super(`${entityName} not found: ${id}`);
    this.name = "EntityNotFoundError";
  }
}

type ValidationErrorDetails = {
  field?: string;
  value?: unknown;
  errors?: string[];
};

export class DomainValidationError extends Error {
  constructor(
    message: string,
    public details?: ValidationErrorDetails,
  ) {
    super(message);
    this.name = "DomainValidationError";
  }
}
