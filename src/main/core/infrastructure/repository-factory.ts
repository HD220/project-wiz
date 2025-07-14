import { Logger } from "./logger";
import { Result } from "../abstractions/result.type";
import { InternalError } from "../errors/internal-error";
import { DrizzleBaseRepository, type RepositoryOptions } from "./drizzle-base-repository";
import { Entity } from "../abstractions/entity.type";

/**
 * Repository factory configuration interface
 */
export interface RepositoryFactoryConfig {
  /** Default repository options */
  readonly defaultOptions: RepositoryOptions;
  /** Repository cache TTL in milliseconds */
  readonly cacheOptions: {
    readonly enabled: boolean;
    readonly ttl: number;
    readonly maxSize: number;
  };
  /** Performance monitoring */
  readonly monitoring: {
    readonly enabled: boolean;
    readonly slowQueryThreshold: number;
  };
}

/**
 * Repository registration interface
 */
export interface RepositoryRegistration<TEntity extends Entity<TId>, TId = string> {
  /** Repository class constructor */
  readonly repositoryClass: new (table: any, entityName: string, options?: RepositoryOptions) => DrizzleBaseRepository<TEntity, TId>;
  /** Database table */
  readonly table: any;
  /** Entity name */
  readonly entityName: string;
  /** Repository options */
  readonly options?: RepositoryOptions;
}

/**
 * Repository metadata interface
 */
export interface RepositoryMetadata {
  /** Entity name */
  readonly entityName: string;
  /** Repository class name */
  readonly repositoryClassName: string;
  /** Creation timestamp */
  readonly createdAt: Date;
  /** Last accessed timestamp */
  readonly lastAccessed: Date;
  /** Access count */
  readonly accessCount: number;
  /** Repository options */
  readonly options: RepositoryOptions;
}

/**
 * Repository factory for creating and managing Drizzle repositories
 * Provides centralized repository creation, caching, and lifecycle management
 */
export class RepositoryFactory {
  private static instance: RepositoryFactory | null = null;
  private readonly logger: Logger;
  private readonly config: RepositoryFactoryConfig;
  private readonly repositories: Map<string, DrizzleBaseRepository<any, any>> = new Map();
  private readonly registrations: Map<string, RepositoryRegistration<any, any>> = new Map();
  private readonly metadata: Map<string, RepositoryMetadata> = new Map();

  private constructor(config?: Partial<RepositoryFactoryConfig>) {
    this.logger = Logger.create("RepositoryFactory");
    this.config = this.buildConfig(config);
  }

  /**
   * Get singleton instance of RepositoryFactory
   */
  public static getInstance(config?: Partial<RepositoryFactoryConfig>): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory(config);
    }
    return RepositoryFactory.instance;
  }

  /**
   * Build configuration with defaults
   */
  private buildConfig(config?: Partial<RepositoryFactoryConfig>): RepositoryFactoryConfig {
    return {
      defaultOptions: {
        softDelete: false,
        auditing: false,
        caching: false,
        cacheTtl: 300000,
        ...config?.defaultOptions,
      },
      cacheOptions: {
        enabled: true,
        ttl: 3600000, // 1 hour
        maxSize: 100,
        ...config?.cacheOptions,
      },
      monitoring: {
        enabled: true,
        slowQueryThreshold: 1000, // 1 second
        ...config?.monitoring,
      },
    };
  }

  /**
   * Register a repository class
   */
  public register<TEntity extends Entity<TId>, TId = string>(
    entityName: string,
    registration: RepositoryRegistration<TEntity, TId>
  ): Result<void, InternalError> {
    try {
      this.logger.debug(`Registering repository for ${entityName}`, {
        repositoryClass: registration.repositoryClass.name,
        entityName: registration.entityName,
      });

      if (this.registrations.has(entityName)) {
        this.logger.warn(`Repository already registered for ${entityName}, overriding`);
      }

      this.registrations.set(entityName, registration);

      this.logger.info(`Repository registered successfully for ${entityName}`);
      return Result.ok(undefined);

    } catch (error) {
      this.logger.error(`Failed to register repository for ${entityName}`, { error });
      return Result.fail(
        new InternalError(
          `Failed to register repository for ${entityName}`,
          "REPOSITORY_REGISTRATION_FAILED",
          error
        )
      );
    }
  }

  /**
   * Create or get cached repository instance
   */
  public create<TEntity extends Entity<TId>, TId = string>(
    entityName: string,
    options?: RepositoryOptions
  ): Result<DrizzleBaseRepository<TEntity, TId>, InternalError> {
    try {
      this.logger.debug(`Creating repository for ${entityName}`, { options });

      // Check if repository is already cached
      const cacheKey = this.buildCacheKey(entityName, options);
      
      if (this.config.cacheOptions.enabled && this.repositories.has(cacheKey)) {
        const cachedRepository = this.repositories.get(cacheKey) as DrizzleBaseRepository<TEntity, TId>;
        
        // Update metadata
        this.updateMetadata(cacheKey);
        
        this.logger.debug(`Returning cached repository for ${entityName}`);
        return Result.ok(cachedRepository);
      }

      // Get registration
      const registration = this.registrations.get(entityName);
      if (!registration) {
        return Result.fail(
          new InternalError(
            `Repository not registered for entity: ${entityName}`,
            "REPOSITORY_NOT_REGISTERED"
          )
        );
      }

      // Merge options
      const finalOptions: RepositoryOptions = {
        ...this.config.defaultOptions,
        ...registration.options,
        ...options,
      };

      // Create repository instance
      const repository = new registration.repositoryClass(
        registration.table,
        registration.entityName,
        finalOptions
      );

      // Cache repository if enabled
      if (this.config.cacheOptions.enabled) {
        this.cacheRepository(cacheKey, repository, entityName, finalOptions);
      }

      this.logger.info(`Repository created successfully for ${entityName}`, {
        repositoryClass: registration.repositoryClass.name,
        options: finalOptions,
      });

      return Result.ok(repository as DrizzleBaseRepository<TEntity, TId>);

    } catch (error) {
      this.logger.error(`Failed to create repository for ${entityName}`, { error });
      return Result.fail(
        new InternalError(
          `Failed to create repository for ${entityName}`,
          "REPOSITORY_CREATION_FAILED",
          error
        )
      );
    }
  }

  /**
   * Get repository without caching
   */
  public createTransient<TEntity extends Entity<TId>, TId = string>(
    entityName: string,
    options?: RepositoryOptions
  ): Result<DrizzleBaseRepository<TEntity, TId>, InternalError> {
    try {
      this.logger.debug(`Creating transient repository for ${entityName}`, { options });

      // Get registration
      const registration = this.registrations.get(entityName);
      if (!registration) {
        return Result.fail(
          new InternalError(
            `Repository not registered for entity: ${entityName}`,
            "REPOSITORY_NOT_REGISTERED"
          )
        );
      }

      // Merge options
      const finalOptions: RepositoryOptions = {
        ...this.config.defaultOptions,
        ...registration.options,
        ...options,
      };

      // Create repository instance
      const repository = new registration.repositoryClass(
        registration.table,
        registration.entityName,
        finalOptions
      );

      this.logger.debug(`Transient repository created for ${entityName}`);
      return Result.ok(repository as DrizzleBaseRepository<TEntity, TId>);

    } catch (error) {
      this.logger.error(`Failed to create transient repository for ${entityName}`, { error });
      return Result.fail(
        new InternalError(
          `Failed to create transient repository for ${entityName}`,
          "TRANSIENT_REPOSITORY_CREATION_FAILED",
          error
        )
      );
    }
  }

  /**
   * Clear repository cache
   */
  public clearCache(entityName?: string): Result<void, InternalError> {
    try {
      if (entityName) {
        this.logger.debug(`Clearing cache for ${entityName}`);
        
        // Clear specific entity repositories
        const keysToDelete: string[] = [];
        for (const [key] of this.repositories) {
          if (key.startsWith(`${entityName}:`)) {
            keysToDelete.push(key);
          }
        }
        
        keysToDelete.forEach(key => {
          this.repositories.delete(key);
          this.metadata.delete(key);
        });
        
        this.logger.debug(`Cleared ${keysToDelete.length} cached repositories for ${entityName}`);
      } else {
        this.logger.debug("Clearing all repository cache");
        
        const count = this.repositories.size;
        this.repositories.clear();
        this.metadata.clear();
        
        this.logger.debug(`Cleared ${count} cached repositories`);
      }

      return Result.ok(undefined);

    } catch (error) {
      this.logger.error("Failed to clear repository cache", { entityName, error });
      return Result.fail(
        new InternalError(
          "Failed to clear repository cache",
          "CACHE_CLEAR_FAILED",
          error
        )
      );
    }
  }

  /**
   * Get repository statistics
   */
  public getStats(): {
    readonly registeredRepositories: number;
    readonly cachedRepositories: number;
    readonly cacheHitRate: number;
    readonly repositories: RepositoryMetadata[];
  } {
    const repositories = Array.from(this.metadata.values());
    const totalAccesses = repositories.reduce((sum, meta) => sum + meta.accessCount, 0);
    const cacheHits = repositories.filter(meta => meta.accessCount > 1).length;
    const cacheHitRate = totalAccesses > 0 ? (cacheHits / totalAccesses) * 100 : 0;

    return {
      registeredRepositories: this.registrations.size,
      cachedRepositories: this.repositories.size,
      cacheHitRate,
      repositories,
    };
  }

  /**
   * Get registered repository names
   */
  public getRegisteredRepositories(): string[] {
    return Array.from(this.registrations.keys());
  }

  /**
   * Check if repository is registered
   */
  public isRegistered(entityName: string): boolean {
    return this.registrations.has(entityName);
  }

  /**
   * Unregister repository
   */
  public unregister(entityName: string): Result<void, InternalError> {
    try {
      this.logger.debug(`Unregistering repository for ${entityName}`);

      if (!this.registrations.has(entityName)) {
        return Result.fail(
          new InternalError(
            `Repository not registered for entity: ${entityName}`,
            "REPOSITORY_NOT_REGISTERED"
          )
        );
      }

      // Remove registration
      this.registrations.delete(entityName);

      // Clear cache for this entity
      this.clearCache(entityName);

      this.logger.info(`Repository unregistered for ${entityName}`);
      return Result.ok(undefined);

    } catch (error) {
      this.logger.error(`Failed to unregister repository for ${entityName}`, { error });
      return Result.fail(
        new InternalError(
          `Failed to unregister repository for ${entityName}`,
          "REPOSITORY_UNREGISTRATION_FAILED",
          error
        )
      );
    }
  }

  /**
   * Build cache key for repository
   */
  private buildCacheKey(entityName: string, options?: RepositoryOptions): string {
    const optionsHash = options ? JSON.stringify(options) : "default";
    return `${entityName}:${optionsHash}`;
  }

  /**
   * Cache repository instance
   */
  private cacheRepository(
    cacheKey: string,
    repository: DrizzleBaseRepository<any, any>,
    entityName: string,
    options: RepositoryOptions
  ): void {
    // Check cache size limit
    if (this.repositories.size >= this.config.cacheOptions.maxSize) {
      this.evictOldestRepository();
    }

    // Cache repository
    this.repositories.set(cacheKey, repository);

    // Store metadata
    this.metadata.set(cacheKey, {
      entityName,
      repositoryClassName: repository.constructor.name,
      createdAt: new Date(),
      lastAccessed: new Date(),
      accessCount: 1,
      options,
    });

    this.logger.debug(`Repository cached`, { cacheKey, entityName });
  }

  /**
   * Update repository metadata on access
   */
  private updateMetadata(cacheKey: string): void {
    const metadata = this.metadata.get(cacheKey);
    if (metadata) {
      this.metadata.set(cacheKey, {
        ...metadata,
        lastAccessed: new Date(),
        accessCount: metadata.accessCount + 1,
      });
    }
  }

  /**
   * Evict oldest repository from cache
   */
  private evictOldestRepository(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, metadata] of this.metadata) {
      if (metadata.lastAccessed.getTime() < oldestTime) {
        oldestTime = metadata.lastAccessed.getTime();
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.repositories.delete(oldestKey);
      this.metadata.delete(oldestKey);
      this.logger.debug("Evicted oldest repository from cache", { cacheKey: oldestKey });
    }
  }

  /**
   * Clean up expired cache entries
   */
  public cleanupExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, metadata] of this.metadata) {
      const age = now - metadata.lastAccessed.getTime();
      if (age > this.config.cacheOptions.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      this.repositories.delete(key);
      this.metadata.delete(key);
    });

    if (expiredKeys.length > 0) {
      this.logger.debug(`Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }

  /**
   * Get factory configuration
   */
  public getConfig(): RepositoryFactoryConfig {
    return { ...this.config };
  }
}