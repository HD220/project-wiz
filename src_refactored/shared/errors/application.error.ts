/**
 * @file Defines the ApplicationError class for errors originating from the application layer.
 */

import { CoreError } from './core.error';

/**
 * Represents errors that occur specifically within the Application layer logic,
 * such as issues in use case orchestration, violations of application-specific
 * business rules (that are not domain invariants), or problems interacting
 * with infrastructure services where the issue is framed from an application
 * perspective.
 *
 * Examples:
 * - A specific sequence of operations in a use case fails.
 * - Data from a repository is in an unexpected format for the application's needs.
 * - An application-level permission check fails.
 */
export class ApplicationError extends CoreError {
  constructor(
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- details can be any structured data
    options?: { code?: string; details?: any; cause?: Error },
  ) {
    super(message, options);
    // Typically 'ApplicationError' or a subclass name.
    // CoreError's constructor already sets this.name = this.constructor.name;
    // So, this line can be removed unless a different name is explicitly desired here.
    // For now, let's remove it for consistency with CoreError.
    // this.name = this.constructor.name;
  }
}

/**
 * A specific type of ApplicationError indicating that an operation cannot be
 * completed because a required resource was not found.
 *
 * This is distinct from a domain-level NotFoundError which might indicate an
 * entity doesn't exist according to domain rules. An ApplicationNotFoundError
 * might relate to application-level resources or configurations.
 * However, often a domain NotFoundError is more appropriate and can be propagated.
 * Use this when the "not found" condition is purely an application-level concern.
 */
export class ApplicationNotFoundError extends ApplicationError {
  constructor(
    resourceName: string,
    identifier?: string | number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- details can be any structured data
    options?: { code?: string; details?: any; cause?: Error },
  ) {
    const message = identifier
      ? `Application resource '${resourceName}' with identifier '${identifier}' not found.`
      : `Application resource '${resourceName}' not found.`;

    // Combine provided details with resourceName and identifier
    const currentDetails = {
      ...(options?.details || {}),
      resourceName,
      identifier,
    };

    super(message, {
      code: options?.code || 'APP_RESOURCE_NOT_FOUND',
      details: currentDetails,
      cause: options?.cause,
    });
    // CoreError constructor handles setting the name.
    // this.name = this.constructor.name;
  }
}

/**
 * A specific type of ApplicationError indicating that an input validation
 * failed at the application use case boundary, specifically for the use case's
 * input DTO, typically validated by Zod.
 *
 * While ZodError itself is often caught and transformed, this error class
 * can be used if a custom Application-level error representation for
 * input DTO validation is preferred over directly using or re-throwing ZodError details.
 * More commonly, the UseCaseWrapper will handle ZodError directly.
 */
export class ApplicationInputValidationError extends ApplicationError {
  constructor(
    message: string = 'Application input validation failed.',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- details can be any structured data, often ZodError.flatten()
    options?: { code?: string; details?: any; cause?: Error },
  ) {
    super(message, {
      code: options?.code || 'APP_INPUT_VALIDATION_ERROR',
      details: options?.details, // 'details' would often be ZodError.flatten()
      cause: options?.cause,
    });
    // CoreError constructor handles setting the name.
    // this.name = this.constructor.name;
  }
}
