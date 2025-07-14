import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { allTables, allRelations } from "../../persistence/schemas";
import { Logger } from "./logger";
import { ConfigurationManager } from "./configuration-manager";
import { Result } from "../abstractions/result.type";
import { InternalError } from "../errors/internal-error";

/**
 * Configuration interface for database connection
 */
export interface DatabaseConfig {
  /** Database file path */
  readonly dbPath: string;
  /** WAL mode enabled */
  readonly walMode: boolean;
  /** Connection timeout in milliseconds */
  readonly timeout: number;
  /** Read-only mode */
  readonly readonly: boolean;
  /** Verbose logging */
  readonly verbose: boolean;
}

/**
 * Database health status interface
 */
export interface DatabaseHealthStatus {
  /** Connection is healthy */
  readonly isHealthy: boolean;
  /** Last health check timestamp */
  readonly lastCheck: Date;
  /** Connection uptime in milliseconds */
  readonly uptime: number;
  /** Number of active connections */
  readonly activeConnections: number;
  /** Database file size in bytes */
  readonly databaseSize: number;
}

/**
 * Database statistics interface
 */
export interface DatabaseStats {
  /** Total number of queries executed */
  readonly totalQueries: number;
  /** Average query execution time */
  readonly avgQueryTime: number;
  /** Number of transactions */
  readonly totalTransactions: number;
  /** Connection pool stats */
  readonly connectionStats: {
    readonly active: number;
    readonly idle: number;
    readonly total: number;
  };
}

/**
 * Central database manager for Drizzle ORM operations
 * Provides connection management, health checks, and monitoring
 */
export class DatabaseManager {
  private static instance: DatabaseManager | null = null;
  private sqlite: Database.Database | null = null;
  private db: BetterSQLite3Database<typeof allTables & typeof allRelations> | null = null;
  private readonly logger: Logger;
  private readonly config: DatabaseConfig;
  private isInitialized = false;
  private startTime: Date = new Date();
  private queryCount = 0;
  private totalQueryTime = 0;
  private transactionCount = 0;

  private constructor(
    config?: Partial<DatabaseConfig>
  ) {
    this.logger = Logger.create("DatabaseManager");
    this.config = this.buildConfig(config);
  }

  /**
   * Get singleton instance of DatabaseManager
   */
  public static getInstance(config?: Partial<DatabaseConfig>): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager(config);
    }
    return DatabaseManager.instance;
  }

  /**
   * Build configuration with defaults
   */
  private buildConfig(config?: Partial<DatabaseConfig>): DatabaseConfig {
    const configManager = ConfigurationManager.getInstance();
    const dbConfig = configManager.getConfig().database || {};

    return {
      dbPath: config?.dbPath || dbConfig.path || "project-wiz.db",
      walMode: config?.walMode ?? dbConfig.walMode ?? true,
      timeout: config?.timeout || dbConfig.timeout || 30000,
      readonly: config?.readonly ?? dbConfig.readonly ?? false,
      verbose: config?.verbose ?? dbConfig.verbose ?? false,
    };
  }

  /**
   * Initialize database connection
   */
  public async initialize(): Promise<Result<void, InternalError>> {
    try {
      if (this.isInitialized) {
        this.logger.warn("Database already initialized");
        return Result.ok(undefined);
      }

      this.logger.info("Initializing database connection", {
        dbPath: this.config.dbPath,
        walMode: this.config.walMode,
        readonly: this.config.readonly,
      });

      // Create SQLite connection
      this.sqlite = new Database(this.config.dbPath, {
        readonly: this.config.readonly,
        timeout: this.config.timeout,
        verbose: this.config.verbose ? console.log : undefined,
      });

      // Configure SQLite
      this.configureSQLite();

      // Create Drizzle instance
      this.db = drizzle(this.sqlite, {
        schema: {
          ...allTables,
          ...allRelations,
        },
      });

      this.isInitialized = true;
      this.startTime = new Date();

      this.logger.info("Database connection initialized successfully");
      return Result.ok(undefined);

    } catch (error) {
      this.logger.error("Failed to initialize database", { error });
      return Result.fail(
        new InternalError(
          "Failed to initialize database connection",
          "DATABASE_INIT_FAILED",
          error
        )
      );
    }
  }

  /**
   * Configure SQLite settings
   */
  private configureSQLite(): void {
    if (!this.sqlite) return;

    try {
      // Enable WAL mode for better concurrency
      if (this.config.walMode) {
        this.sqlite.pragma("journal_mode = WAL");
      }

      // Set foreign keys
      this.sqlite.pragma("foreign_keys = ON");

      // Set busy timeout
      this.sqlite.pragma(`busy_timeout = ${this.config.timeout}`);

      // Set synchronous mode
      this.sqlite.pragma("synchronous = NORMAL");

      // Set cache size (in KB)
      this.sqlite.pragma("cache_size = -64000"); // 64MB

      this.logger.debug("SQLite configuration applied");

    } catch (error) {
      this.logger.error("Failed to configure SQLite", { error });
      throw error;
    }
  }

  /**
   * Get Drizzle database instance
   */
  public getDatabase(): BetterSQLite3Database<typeof allTables & typeof allRelations> {
    if (!this.db || !this.isInitialized) {
      throw new InternalError(
        "Database not initialized. Call initialize() first.",
        "DATABASE_NOT_INITIALIZED"
      );
    }
    return this.db;
  }

  /**
   * Get SQLite database instance
   */
  public getSQLiteDatabase(): Database.Database {
    if (!this.sqlite || !this.isInitialized) {
      throw new InternalError(
        "Database not initialized. Call initialize() first.",
        "DATABASE_NOT_INITIALIZED"
      );
    }
    return this.sqlite;
  }

  /**
   * Perform health check
   */
  public async healthCheck(): Promise<Result<DatabaseHealthStatus, InternalError>> {
    try {
      if (!this.isInitialized || !this.db) {
        return Result.fail(
          new InternalError("Database not initialized", "DATABASE_NOT_INITIALIZED")
        );
      }

      // Simple query to test connection
      const testResult = this.db.run("SELECT 1");
      
      const now = new Date();
      const uptime = now.getTime() - this.startTime.getTime();
      
      // Get database file size
      const stats = this.sqlite?.prepare("PRAGMA page_count").get() as { page_count: number } || { page_count: 0 };
      const pageSize = this.sqlite?.prepare("PRAGMA page_size").get() as { page_size: number } || { page_size: 4096 };
      const databaseSize = stats.page_count * pageSize.page_size;

      const healthStatus: DatabaseHealthStatus = {
        isHealthy: true,
        lastCheck: now,
        uptime,
        activeConnections: 1, // SQLite is single connection
        databaseSize,
      };

      this.logger.debug("Database health check passed", healthStatus);
      return Result.ok(healthStatus);

    } catch (error) {
      this.logger.error("Database health check failed", { error });
      return Result.fail(
        new InternalError(
          "Database health check failed",
          "DATABASE_HEALTH_CHECK_FAILED",
          error
        )
      );
    }
  }

  /**
   * Get database statistics
   */
  public getStats(): DatabaseStats {
    const avgQueryTime = this.queryCount > 0 ? this.totalQueryTime / this.queryCount : 0;

    return {
      totalQueries: this.queryCount,
      avgQueryTime,
      totalTransactions: this.transactionCount,
      connectionStats: {
        active: this.isInitialized ? 1 : 0,
        idle: 0,
        total: 1,
      },
    };
  }

  /**
   * Record query execution for statistics
   */
  public recordQuery(executionTime: number): void {
    this.queryCount++;
    this.totalQueryTime += executionTime;
  }

  /**
   * Record transaction for statistics
   */
  public recordTransaction(): void {
    this.transactionCount++;
  }

  /**
   * Close database connection
   */
  public async close(): Promise<Result<void, InternalError>> {
    try {
      if (!this.isInitialized) {
        this.logger.warn("Database not initialized, nothing to close");
        return Result.ok(undefined);
      }

      this.logger.info("Closing database connection");

      if (this.sqlite) {
        this.sqlite.close();
        this.sqlite = null;
      }

      this.db = null;
      this.isInitialized = false;
      DatabaseManager.instance = null;

      this.logger.info("Database connection closed successfully");
      return Result.ok(undefined);

    } catch (error) {
      this.logger.error("Failed to close database connection", { error });
      return Result.fail(
        new InternalError(
          "Failed to close database connection",
          "DATABASE_CLOSE_FAILED",
          error
        )
      );
    }
  }

  /**
   * Check if database is initialized
   */
  public isReady(): boolean {
    return this.isInitialized && this.db !== null && this.sqlite !== null;
  }

  /**
   * Get database configuration
   */
  public getConfig(): DatabaseConfig {
    return { ...this.config };
  }
}