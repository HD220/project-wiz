import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { DatabaseManager } from "./database-manager";
import { Logger } from "./logger";
import { Result } from "../abstractions/result.type";
import { InternalError } from "../errors/internal-error";
import * as fs from "fs";
import * as path from "path";

/**
 * Migration status enumeration
 */
export enum MigrationStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  ROLLED_BACK = "ROLLED_BACK",
}

/**
 * Migration info interface
 */
export interface MigrationInfo {
  /** Migration file name */
  readonly name: string;
  /** Migration status */
  readonly status: MigrationStatus;
  /** Execution timestamp */
  readonly executedAt?: Date;
  /** Execution time in milliseconds */
  readonly executionTime?: number;
  /** Error message if failed */
  readonly error?: string;
  /** Migration hash for integrity */
  readonly hash: string;
}

/**
 * Migration result interface
 */
export interface MigrationResult {
  /** Applied migrations */
  readonly applied: MigrationInfo[];
  /** Failed migrations */
  readonly failed: MigrationInfo[];
  /** Total execution time */
  readonly totalTime: number;
  /** Success status */
  readonly success: boolean;
}

/**
 * Migration options interface
 */
export interface MigrationOptions {
  /** Migrations folder path */
  readonly migrationsFolder?: string;
  /** Force migration even if hash mismatch */
  readonly force?: boolean;
  /** Dry run (don't execute) */
  readonly dryRun?: boolean;
  /** Target migration (migrate up to this) */
  readonly target?: string;
  /** Rollback to specific migration */
  readonly rollbackTo?: string;
}

/**
 * Migration metadata interface
 */
export interface MigrationMetadata {
  /** Migration name */
  readonly name: string;
  /** Migration hash */
  readonly hash: string;
  /** Applied timestamp */
  readonly appliedAt: Date;
  /** Execution time */
  readonly executionTime: number;
}

/**
 * Migration manager for Drizzle ORM migrations
 * Provides migration execution, rollback, and status tracking
 */
export class MigrationManager {
  private static instance: MigrationManager | null = null;
  private readonly logger: Logger;
  private readonly databaseManager: DatabaseManager;
  private readonly defaultMigrationsFolder: string;
  private isRunning = false;

  private constructor() {
    this.logger = Logger.create("MigrationManager");
    this.databaseManager = DatabaseManager.getInstance();
    this.defaultMigrationsFolder = path.join(process.cwd(), "src/main/persistence/migrations");
  }

  /**
   * Get singleton instance of MigrationManager
   */
  public static getInstance(): MigrationManager {
    if (!MigrationManager.instance) {
      MigrationManager.instance = new MigrationManager();
    }
    return MigrationManager.instance;
  }

  /**
   * Run pending migrations
   */
  public async migrate(options: MigrationOptions = {}): Promise<Result<MigrationResult, InternalError>> {
    if (this.isRunning) {
      return Result.fail(
        new InternalError(
          "Migration is already running",
          "MIGRATION_ALREADY_RUNNING"
        )
      );
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      const migrationsFolder = options.migrationsFolder || this.defaultMigrationsFolder;

      this.logger.info("Starting migration process", {
        migrationsFolder,
        options,
      });

      // Validate migrations folder
      if (!fs.existsSync(migrationsFolder)) {
        return Result.fail(
          new InternalError(
            `Migrations folder not found: ${migrationsFolder}`,
            "MIGRATIONS_FOLDER_NOT_FOUND"
          )
        );
      }

      // Initialize migration tracking table
      await this.initializeMigrationTable();

      // Get pending migrations
      const pendingMigrations = await this.getPendingMigrations(migrationsFolder);
      
      if (pendingMigrations.length === 0) {
        this.logger.info("No pending migrations found");
        return Result.ok({
          applied: [],
          failed: [],
          totalTime: Date.now() - startTime,
          success: true,
        });
      }

      // Apply target filter if specified
      const migrationsToApply = options.target 
        ? this.filterMigrationsToTarget(pendingMigrations, options.target)
        : pendingMigrations;

      if (options.dryRun) {
        this.logger.info("Dry run mode - migrations that would be applied:", {
          migrations: migrationsToApply.map(m => m.name),
        });
        
        return Result.ok({
          applied: migrationsToApply.map(m => ({ ...m, status: MigrationStatus.PENDING })),
          failed: [],
          totalTime: Date.now() - startTime,
          success: true,
        });
      }

      // Apply migrations
      const applied: MigrationInfo[] = [];
      const failed: MigrationInfo[] = [];

      for (const migration of migrationsToApply) {
        try {
          const migrationStartTime = Date.now();
          
          this.logger.info(`Applying migration: ${migration.name}`);

          // Execute migration using Drizzle
          const db = this.databaseManager.getDatabase();
          await migrate(db, { migrationsFolder });

          const executionTime = Date.now() - migrationStartTime;

          // Record migration
          await this.recordMigration({
            name: migration.name,
            hash: migration.hash,
            appliedAt: new Date(),
            executionTime,
          });

          applied.push({
            ...migration,
            status: MigrationStatus.COMPLETED,
            executedAt: new Date(),
            executionTime,
          });

          this.logger.info(`Migration applied successfully: ${migration.name}`, {
            executionTime,
          });

        } catch (error) {
          this.logger.error(`Migration failed: ${migration.name}`, { error });
          
          failed.push({
            ...migration,
            status: MigrationStatus.FAILED,
            error: error instanceof Error ? error.message : String(error),
          });

          // Stop on first failure unless force is enabled
          if (!options.force) {
            break;
          }
        }
      }

      const totalTime = Date.now() - startTime;
      const success = failed.length === 0;

      this.logger.info("Migration process completed", {
        applied: applied.length,
        failed: failed.length,
        totalTime,
        success,
      });

      return Result.ok({
        applied,
        failed,
        totalTime,
        success,
      });

    } catch (error) {
      this.logger.error("Migration process failed", { error });
      
      return Result.fail(
        new InternalError(
          "Migration process failed",
          "MIGRATION_PROCESS_FAILED",
          error
        )
      );
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get migration status
   */
  public async getStatus(migrationsFolder?: string): Promise<Result<MigrationInfo[], InternalError>> {
    try {
      const folder = migrationsFolder || this.defaultMigrationsFolder;
      
      if (!fs.existsSync(folder)) {
        return Result.fail(
          new InternalError(
            `Migrations folder not found: ${folder}`,
            "MIGRATIONS_FOLDER_NOT_FOUND"
          )
        );
      }

      // Get all migration files
      const allMigrations = this.getMigrationFiles(folder);
      
      // Get applied migrations from database
      const appliedMigrations = await this.getAppliedMigrations();
      const appliedMap = new Map(appliedMigrations.map(m => [m.name, m]));

      // Build status list
      const status: MigrationInfo[] = allMigrations.map(migration => {
        const applied = appliedMap.get(migration.name);
        
        return {
          name: migration.name,
          hash: migration.hash,
          status: applied ? MigrationStatus.COMPLETED : MigrationStatus.PENDING,
          executedAt: applied?.appliedAt,
          executionTime: applied?.executionTime,
        };
      });

      return Result.ok(status);

    } catch (error) {
      this.logger.error("Failed to get migration status", { error });
      
      return Result.fail(
        new InternalError(
          "Failed to get migration status",
          "MIGRATION_STATUS_FAILED",
          error
        )
      );
    }
  }

  /**
   * Rollback migrations
   */
  public async rollback(target: string, options: MigrationOptions = {}): Promise<Result<MigrationResult, InternalError>> {
    if (this.isRunning) {
      return Result.fail(
        new InternalError(
          "Migration is already running",
          "MIGRATION_ALREADY_RUNNING"
        )
      );
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      this.logger.warn("Starting migration rollback", { target, options });

      // Get applied migrations
      const appliedMigrations = await this.getAppliedMigrations();
      
      // Find target migration
      const targetIndex = appliedMigrations.findIndex(m => m.name === target);
      
      if (targetIndex === -1) {
        return Result.fail(
          new InternalError(
            `Target migration not found: ${target}`,
            "TARGET_MIGRATION_NOT_FOUND"
          )
        );
      }

      // Get migrations to rollback (newer than target)
      const migrationsToRollback = appliedMigrations.slice(targetIndex + 1).reverse();

      if (migrationsToRollback.length === 0) {
        this.logger.info("No migrations to rollback");
        return Result.ok({
          applied: [],
          failed: [],
          totalTime: Date.now() - startTime,
          success: true,
        });
      }

      if (options.dryRun) {
        this.logger.info("Dry run mode - migrations that would be rolled back:", {
          migrations: migrationsToRollback.map(m => m.name),
        });
        
        return Result.ok({
          applied: [],
          failed: [],
          totalTime: Date.now() - startTime,
          success: true,
        });
      }

      // Rollback migrations
      const rolledBack: MigrationInfo[] = [];
      const failed: MigrationInfo[] = [];

      for (const migration of migrationsToRollback) {
        try {
          this.logger.warn(`Rolling back migration: ${migration.name}`);

          // Remove migration record
          await this.removeMigrationRecord(migration.name);

          rolledBack.push({
            name: migration.name,
            hash: migration.hash,
            status: MigrationStatus.ROLLED_BACK,
            executedAt: new Date(),
          });

          this.logger.warn(`Migration rolled back: ${migration.name}`);

        } catch (error) {
          this.logger.error(`Rollback failed: ${migration.name}`, { error });
          
          failed.push({
            name: migration.name,
            hash: migration.hash,
            status: MigrationStatus.FAILED,
            error: error instanceof Error ? error.message : String(error),
          });

          if (!options.force) {
            break;
          }
        }
      }

      const totalTime = Date.now() - startTime;
      const success = failed.length === 0;

      this.logger.warn("Migration rollback completed", {
        rolledBack: rolledBack.length,
        failed: failed.length,
        totalTime,
        success,
      });

      return Result.ok({
        applied: rolledBack,
        failed,
        totalTime,
        success,
      });

    } catch (error) {
      this.logger.error("Migration rollback failed", { error });
      
      return Result.fail(
        new InternalError(
          "Migration rollback failed",
          "MIGRATION_ROLLBACK_FAILED",
          error
        )
      );
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Initialize migration tracking table
   */
  private async initializeMigrationTable(): Promise<void> {
    const db = this.databaseManager.getSQLiteDatabase();
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS __drizzle_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        hash TEXT NOT NULL,
        applied_at INTEGER NOT NULL,
        execution_time INTEGER NOT NULL
      )
    `);
  }

  /**
   * Get migration files from folder
   */
  private getMigrationFiles(migrationsFolder: string): MigrationInfo[] {
    const files = fs.readdirSync(migrationsFolder)
      .filter(file => file.endsWith('.sql'))
      .sort();

    return files.map(file => {
      const filePath = path.join(migrationsFolder, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const hash = this.generateHash(content);

      return {
        name: file,
        hash,
        status: MigrationStatus.PENDING,
      };
    });
  }

  /**
   * Get pending migrations
   */
  private async getPendingMigrations(migrationsFolder: string): Promise<MigrationInfo[]> {
    const allMigrations = this.getMigrationFiles(migrationsFolder);
    const appliedMigrations = await this.getAppliedMigrations();
    const appliedNames = new Set(appliedMigrations.map(m => m.name));

    return allMigrations.filter(m => !appliedNames.has(m.name));
  }

  /**
   * Get applied migrations from database
   */
  private async getAppliedMigrations(): Promise<MigrationMetadata[]> {
    try {
      const db = this.databaseManager.getSQLiteDatabase();
      const statement = db.prepare(`
        SELECT name, hash, applied_at, execution_time 
        FROM __drizzle_migrations 
        ORDER BY applied_at ASC
      `);
      
      const rows = statement.all() as Array<{
        name: string;
        hash: string;
        applied_at: number;
        execution_time: number;
      }>;

      return rows.map(row => ({
        name: row.name,
        hash: row.hash,
        appliedAt: new Date(row.applied_at),
        executionTime: row.execution_time,
      }));

    } catch (error) {
      this.logger.error("Failed to get applied migrations", { error });
      return [];
    }
  }

  /**
   * Record migration in database
   */
  private async recordMigration(metadata: MigrationMetadata): Promise<void> {
    const db = this.databaseManager.getSQLiteDatabase();
    const statement = db.prepare(`
      INSERT INTO __drizzle_migrations (name, hash, applied_at, execution_time)
      VALUES (?, ?, ?, ?)
    `);
    
    statement.run(
      metadata.name,
      metadata.hash,
      metadata.appliedAt.getTime(),
      metadata.executionTime
    );
  }

  /**
   * Remove migration record from database
   */
  private async removeMigrationRecord(name: string): Promise<void> {
    const db = this.databaseManager.getSQLiteDatabase();
    const statement = db.prepare(`
      DELETE FROM __drizzle_migrations WHERE name = ?
    `);
    
    statement.run(name);
  }

  /**
   * Filter migrations to target
   */
  private filterMigrationsToTarget(migrations: MigrationInfo[], target: string): MigrationInfo[] {
    const targetIndex = migrations.findIndex(m => m.name === target);
    return targetIndex === -1 ? migrations : migrations.slice(0, targetIndex + 1);
  }

  /**
   * Generate content hash
   */
  private generateHash(content: string): string {
    // Simple hash function for content integrity
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Check if migration is running
   */
  public isRunningMigration(): boolean {
    return this.isRunning;
  }
}