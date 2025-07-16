import { BaseError } from "./base.error";
import { ErrorMetadata } from "./error-metadata.interface";

export class NotFoundError extends BaseError {
  constructor(message: string, code?: string, context?: ErrorMetadata) {
    super(message, "NotFoundError", {
      code,
      context,
    });
  }

  static entityNotFound(
    entityType: string,
    identifier: string | number,
  ): NotFoundError {
    return new NotFoundError(
      `${entityType} with identifier '${identifier}' was not found`,
      "ENTITY_NOT_FOUND",
      { entityType, identifier },
    );
  }

  static resourceNotFound(resource: string, path?: string): NotFoundError {
    return new NotFoundError(
      `Resource '${resource}' not found${path ? ` at path: ${path}` : ""}`,
      "RESOURCE_NOT_FOUND",
      { resource, path },
    );
  }

  getUserMessage(): string {
    return "The requested item could not be found.";
  }
}
