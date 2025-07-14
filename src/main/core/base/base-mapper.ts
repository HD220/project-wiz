/**
 * Base mapper class providing common mapping functionality
 * Implements standardized data transformation patterns with error handling
 */

import { IMapper } from "../abstractions";

/**
 * Abstract base class for all mappers in the system
 * Provides common mapping functionality with:
 * - Bidirectional mapping between domain and DTO objects
 * - Error handling for transformation failures
 * - Logging of mapping operations
 * - Validation of mapping results
 * - Null/undefined safety
 */
export abstract class BaseMapper<TDomain, TDto>
  implements IMapper<TDomain, TDto>
{
  protected readonly mapperName: string;

  /**
   * Creates a new mapper instance
   * @param mapperName - Name of the mapper for logging purposes
   */
  protected constructor(mapperName: string) {
    this.mapperName = mapperName;
  }

  /**
   * Maps a DTO object to a domain object
   * @param dto - The DTO object to map
   * @returns Domain object
   */
  public toDomain(dto: TDto): TDomain {
    try {
      this.logMapping("toDomain", dto);

      if (!dto) {
        throw new Error("DTO cannot be null or undefined");
      }

      const domain = this.doToDomain(dto);

      if (!domain) {
        throw new Error("Domain mapping resulted in null/undefined");
      }

      this.logMappingSuccess("toDomain", dto, domain);
      return domain;
    } catch (error) {
      this.logError("toDomain", error, dto);
      throw error;
    }
  }

  /**
   * Maps a domain object to a DTO object
   * @param domain - The domain object to map
   * @returns DTO object
   */
  public toDto(domain: TDomain): TDto {
    try {
      this.logMapping("toDto", domain);

      if (!domain) {
        throw new Error("Domain cannot be null or undefined");
      }

      const dto = this.doToDto(domain);

      if (!dto) {
        throw new Error("DTO mapping resulted in null/undefined");
      }

      this.logMappingSuccess("toDto", domain, dto);
      return dto;
    } catch (error) {
      this.logError("toDto", error, domain);
      throw error;
    }
  }

  /**
   * Maps an array of domain objects to an array of DTOs
   * @param domains - Array of domain objects to map
   * @returns Array of DTO objects
   */
  public toDtoArray(domains: TDomain[]): TDto[] {
    try {
      if (!domains || !Array.isArray(domains)) {
        throw new Error("Domain array cannot be null or undefined");
      }

      return domains.map((domain) => this.toDto(domain));
    } catch (error) {
      this.logError("toDtoArray", error, domains);
      throw error;
    }
  }

  /**
   * Maps an array of DTOs to an array of domain objects
   * @param dtos - Array of DTOs to map
   * @returns Array of domain objects
   */
  public toDomainArray(dtos: TDto[]): TDomain[] {
    try {
      if (!dtos || !Array.isArray(dtos)) {
        throw new Error("DTO array cannot be null or undefined");
      }

      return dtos.map((dto) => this.toDomain(dto));
    } catch (error) {
      this.logError("toDomainArray", error, dtos);
      throw error;
    }
  }

  /**
   * Safely maps a domain object to a DTO, returning null if input is null/undefined
   * @param domain - Domain object to map (can be null/undefined)
   * @returns DTO object or null
   */
  protected toDtoOrNull(domain: TDomain | null | undefined): TDto | null {
    try {
      if (!domain) return null;
      return this.toDto(domain);
    } catch (error) {
      this.logError("toDtoOrNull", error, domain);
      return null;
    }
  }

  /**
   * Safely maps a DTO to a domain object, returning null if input is null/undefined
   * @param dto - DTO to map (can be null/undefined)
   * @returns Domain object or null
   */
  protected toDomainOrNull(dto: TDto | null | undefined): TDomain | null {
    try {
      if (!dto) return null;
      return this.toDomain(dto);
    } catch (error) {
      this.logError("toDomainOrNull", error, dto);
      return null;
    }
  }

  /**
   * Performs the actual mapping from DTO to domain object
   * Override this method to implement specific mapping logic
   * @param dto - DTO to map
   * @returns Domain object
   */
  protected abstract doToDomain(dto: TDto): TDomain;

  /**
   * Performs the actual mapping from domain to DTO object
   * Override this method to implement specific mapping logic
   * @param domain - Domain object to map
   * @returns DTO object
   */
  protected abstract doToDto(domain: TDomain): TDto;

  /**
   * Creates a new instance of the domain object
   * Override this method to provide custom domain object creation
   * @param data - Data to create domain object from
   * @returns Domain object
   */
  protected createDomainObject(data: any): TDomain {
    // Default implementation - override in derived classes
    return data as TDomain;
  }

  /**
   * Creates a new instance of the DTO object
   * Override this method to provide custom DTO creation
   * @param data - Data to create DTO from
   * @returns DTO object
   */
  protected createDtoObject(data: any): TDto {
    // Default implementation - override in derived classes
    return data as TDto;
  }

  /**
   * Validates a domain object before mapping
   * Override this method to implement custom validation
   * @param domain - Domain object to validate
   * @returns True if valid, false otherwise
   */
  protected validateDomain(domain: TDomain): boolean {
    return domain !== null && domain !== undefined;
  }

  /**
   * Validates a DTO object before mapping
   * Override this method to implement custom validation
   * @param dto - DTO object to validate
   * @returns True if valid, false otherwise
   */
  protected validateDto(dto: TDto): boolean {
    return dto !== null && dto !== undefined;
  }

  // Logging methods

  /**
   * Logs the start of a mapping operation
   * @param operation - The operation name
   * @param source - Source object being mapped
   */
  private logMapping(operation: string, source: any): void {
    console.log(
      `[${this.mapperName}Mapper] ${operation}`,
      this.sanitizeForLog(source),
    );
  }

  /**
   * Logs successful mapping
   * @param operation - The operation name
   * @param source - Source object
   * @param target - Target object
   */
  private logMappingSuccess(operation: string, source: any, target: any): void {
    console.log(`[${this.mapperName}Mapper] ${operation} SUCCESS`, {
      source: this.sanitizeForLog(source),
      target: this.sanitizeForLog(target),
    });
  }

  /**
   * Logs mapping error
   * @param operation - The operation name
   * @param error - The error that occurred
   * @param source - Source object being mapped
   */
  private logError(operation: string, error: any, source: any): void {
    console.error(`[${this.mapperName}Mapper] ${operation} ERROR`, {
      error: error.message,
      source: this.sanitizeForLog(source),
    });
  }

  /**
   * Sanitizes data for logging
   * @param data - The data to sanitize
   * @returns Sanitized data
   */
  private sanitizeForLog(data: any): any {
    if (typeof data === "string") {
      return data.length > 50 ? `${data.substring(0, 50)}...` : data;
    }
    if (typeof data === "object" && data !== null) {
      return "[Object]";
    }
    return data;
  }
}
