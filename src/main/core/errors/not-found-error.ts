import { DomainError } from "./domain-error";

/**
 * Error codes for not found errors
 */
export enum NotFoundErrorCode {
  RESOURCE_NOT_FOUND = "NOT_FOUND_001",
  ENTITY_NOT_FOUND = "NOT_FOUND_002",
  FILE_NOT_FOUND = "NOT_FOUND_003",
  CONFIGURATION_NOT_FOUND = "NOT_FOUND_004",
  SERVICE_NOT_FOUND = "NOT_FOUND_005",
  ENDPOINT_NOT_FOUND = "NOT_FOUND_006",
  USER_NOT_FOUND = "NOT_FOUND_007",
  PROJECT_NOT_FOUND = "NOT_FOUND_008",
  AGENT_NOT_FOUND = "NOT_FOUND_009",
  CHANNEL_NOT_FOUND = "NOT_FOUND_010",
}

/**
 * Represents information about the resource that was not found
 */
export interface NotFoundResourceInfo {
  /** Type of resource that was not found */
  resourceType: string;
  /** Identifier used to search for the resource */
  identifier: string | number;
  /** Field name used for the search */
  searchField?: string;
  /** Additional context about the search */
  context?: Record<string, unknown>;
}

/**
 * Error thrown when a requested resource is not found
 */
export class NotFoundError extends DomainError {
  /** Information about the resource that was not found */
  public readonly resourceInfo: NotFoundResourceInfo;

  /**
   * Creates a new NotFoundError instance
   * @param code - Not found error code
   * @param message - Error message
   * @param resourceInfo - Information about the resource that was not found
   * @param details - Additional error details
   * @param originalError - Original error if this is a wrapped error
   */
  constructor(
    code: NotFoundErrorCode,
    message: string,
    resourceInfo: NotFoundResourceInfo,
    details?: Record<string, unknown>,
    originalError?: Error,
  ) {
    super(code, message, details, originalError);

    this.resourceInfo = resourceInfo;

    // Set the prototype explicitly
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  /**
   * Gets error severity level
   * @returns Always returns 'warning' for not found errors
   */
  public getSeverity(): "warning" {
    return "warning";
  }

  /**
   * Gets error category for classification
   * @returns Always returns 'not_found'
   */
  public getCategory(): string {
    return "not_found";
  }

  /**
   * Checks if this error is retryable
   * @returns Always returns false for not found errors
   */
  public isRetryable(): boolean {
    return false;
  }

  /**
   * Gets recovery suggestions for the error
   * @returns Array of recovery suggestions
   */
  public getRecoverySuggestions(): string[] {
    const suggestions: string[] = [];

    switch (this.code) {
      case NotFoundErrorCode.RESOURCE_NOT_FOUND:
        suggestions.push("Verify the resource identifier is correct");
        suggestions.push("Check if the resource exists in the system");
        break;
      case NotFoundErrorCode.ENTITY_NOT_FOUND:
        suggestions.push("Verify the entity ID is correct");
        suggestions.push("Check if the entity was deleted");
        break;
      case NotFoundErrorCode.FILE_NOT_FOUND:
        suggestions.push("Verify the file path is correct");
        suggestions.push("Check if the file exists");
        break;
      case NotFoundErrorCode.CONFIGURATION_NOT_FOUND:
        suggestions.push("Check if the configuration is properly set");
        suggestions.push("Verify configuration file exists");
        break;
      case NotFoundErrorCode.SERVICE_NOT_FOUND:
        suggestions.push("Verify the service is registered");
        suggestions.push("Check if the service is available");
        break;
      case NotFoundErrorCode.ENDPOINT_NOT_FOUND:
        suggestions.push("Verify the endpoint URL is correct");
        suggestions.push("Check if the endpoint exists");
        break;
      case NotFoundErrorCode.USER_NOT_FOUND:
        suggestions.push("Verify the user exists");
        suggestions.push("Check if the user was deactivated");
        break;
      case NotFoundErrorCode.PROJECT_NOT_FOUND:
        suggestions.push("Verify the project ID is correct");
        suggestions.push("Check if the project was deleted");
        break;
      case NotFoundErrorCode.AGENT_NOT_FOUND:
        suggestions.push("Verify the agent ID is correct");
        suggestions.push("Check if the agent was removed");
        break;
      case NotFoundErrorCode.CHANNEL_NOT_FOUND:
        suggestions.push("Verify the channel ID is correct");
        suggestions.push("Check if the channel was deleted");
        break;
      default:
        suggestions.push("Verify the identifier is correct");
    }

    suggestions.push(`Resource type: ${this.resourceInfo.resourceType}`);
    suggestions.push(`Identifier: ${this.resourceInfo.identifier}`);

    if (this.resourceInfo.searchField) {
      suggestions.push(`Search field: ${this.resourceInfo.searchField}`);
    }

    return suggestions;
  }

  /**
   * Converts error to JSON representation including resource information
   * @returns JSON representation of the error
   */
  public toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      resourceInfo: this.resourceInfo,
    };
  }

  /**
   * Creates a NotFoundError for a generic resource
   * @param resourceType - Type of resource
   * @param identifier - Resource identifier
   * @param message - Custom message
   * @returns NotFoundError instance
   */
  public static resource(
    resourceType: string,
    identifier: string | number,
    message?: string,
  ): NotFoundError {
    return new NotFoundError(
      NotFoundErrorCode.RESOURCE_NOT_FOUND,
      message || `${resourceType} with identifier '${identifier}' not found`,
      { resourceType, identifier },
    );
  }

  /**
   * Creates a NotFoundError for an entity
   * @param entityType - Type of entity
   * @param id - Entity ID
   * @param message - Custom message
   * @returns NotFoundError instance
   */
  public static entity(
    entityType: string,
    id: string | number,
    message?: string,
  ): NotFoundError {
    return new NotFoundError(
      NotFoundErrorCode.ENTITY_NOT_FOUND,
      message || `${entityType} with ID '${id}' not found`,
      { resourceType: entityType, identifier: id, searchField: "id" },
    );
  }

  /**
   * Creates a NotFoundError for a file
   * @param filePath - Path to the file
   * @param message - Custom message
   * @returns NotFoundError instance
   */
  public static file(filePath: string, message?: string): NotFoundError {
    return new NotFoundError(
      NotFoundErrorCode.FILE_NOT_FOUND,
      message || `File '${filePath}' not found`,
      { resourceType: "file", identifier: filePath, searchField: "path" },
    );
  }

  /**
   * Creates a NotFoundError for a user
   * @param userId - User ID
   * @param message - Custom message
   * @returns NotFoundError instance
   */
  public static user(userId: string | number, message?: string): NotFoundError {
    return new NotFoundError(
      NotFoundErrorCode.USER_NOT_FOUND,
      message || `User with ID '${userId}' not found`,
      { resourceType: "user", identifier: userId, searchField: "id" },
    );
  }

  /**
   * Creates a NotFoundError for a project
   * @param projectId - Project ID
   * @param message - Custom message
   * @returns NotFoundError instance
   */
  public static project(
    projectId: string | number,
    message?: string,
  ): NotFoundError {
    return new NotFoundError(
      NotFoundErrorCode.PROJECT_NOT_FOUND,
      message || `Project with ID '${projectId}' not found`,
      { resourceType: "project", identifier: projectId, searchField: "id" },
    );
  }

  /**
   * Creates a NotFoundError for an agent
   * @param agentId - Agent ID
   * @param message - Custom message
   * @returns NotFoundError instance
   */
  public static agent(
    agentId: string | number,
    message?: string,
  ): NotFoundError {
    return new NotFoundError(
      NotFoundErrorCode.AGENT_NOT_FOUND,
      message || `Agent with ID '${agentId}' not found`,
      { resourceType: "agent", identifier: agentId, searchField: "id" },
    );
  }

  /**
   * Creates a NotFoundError for a channel
   * @param channelId - Channel ID
   * @param message - Custom message
   * @returns NotFoundError instance
   */
  public static channel(
    channelId: string | number,
    message?: string,
  ): NotFoundError {
    return new NotFoundError(
      NotFoundErrorCode.CHANNEL_NOT_FOUND,
      message || `Channel with ID '${channelId}' not found`,
      { resourceType: "channel", identifier: channelId, searchField: "id" },
    );
  }
}
