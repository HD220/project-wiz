/**
 * Generic mapper interface for converting between different object types
 * Defines contract for mapping operations between layers
 *
 * @template TDomain - Domain object type
 * @template TDto - Data Transfer Object type
 */
export interface IMapper<TDomain, TDto> {
  /**
   * Convert domain object to DTO
   * @param domain - Domain object to convert
   * @returns DTO representation of the domain object
   */
  toDto(domain: TDomain): TDto;

  /**
   * Convert DTO to domain object
   * @param dto - DTO to convert
   * @returns Domain object representation of the DTO
   */
  toDomain(dto: TDto): TDomain;

  /**
   * Convert array of domain objects to DTOs
   * @param domains - Array of domain objects to convert
   * @returns Array of DTO representations
   */
  toDtoArray(domains: TDomain[]): TDto[];

  /**
   * Convert array of DTOs to domain objects
   * @param dtos - Array of DTOs to convert
   * @returns Array of domain object representations
   */
  toDomainArray(dtos: TDto[]): TDomain[];
}

/**
 * Extended mapper interface with optional mapping operations
 * Handles cases where source object might be null or undefined
 *
 * @template TDomain - Domain object type
 * @template TDto - Data Transfer Object type
 */
export interface IOptionalMapper<TDomain, TDto> extends IMapper<TDomain, TDto> {
  /**
   * Convert domain object to DTO with null safety
   * @param domain - Domain object to convert (can be null/undefined)
   * @returns DTO representation or null if input is null/undefined
   */
  toDtoOrNull(domain: TDomain | null | undefined): TDto | null;

  /**
   * Convert DTO to domain object with null safety
   * @param dto - DTO to convert (can be null/undefined)
   * @returns Domain object representation or null if input is null/undefined
   */
  toDomainOrNull(dto: TDto | null | undefined): TDomain | null;
}
