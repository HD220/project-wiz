import { type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { and, or, eq, ne, gt, gte, lt, lte, like, ilike, isNull, isNotNull, inArray, notInArray, desc, asc, count, avg, sum, min, max } from "drizzle-orm";
import { type SQL, type Column } from "drizzle-orm";
import { DatabaseManager } from "./database-manager";
import { Logger } from "./logger";
import { Result } from "../abstractions/result.type";
import { InternalError } from "../errors/internal-error";
import { allTables, allRelations } from "../../persistence/schemas";

/**
 * Query operator enumeration
 */
export enum QueryOperator {
  EQUALS = "equals",
  NOT_EQUALS = "notEquals",
  GREATER_THAN = "greaterThan",
  GREATER_THAN_OR_EQUAL = "greaterThanOrEqual",
  LESS_THAN = "lessThan",
  LESS_THAN_OR_EQUAL = "lessThanOrEqual",
  LIKE = "like",
  ILIKE = "ilike",
  IS_NULL = "isNull",
  IS_NOT_NULL = "isNotNull",
  IN = "in",
  NOT_IN = "notIn",
}

/**
 * Sort direction enumeration
 */
export enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}

/**
 * Aggregate function enumeration
 */
export enum AggregateFunction {
  COUNT = "count",
  SUM = "sum",
  AVG = "avg",
  MIN = "min",
  MAX = "max",
}

/**
 * Query condition interface
 */
export interface QueryCondition {
  /** Column to filter */
  readonly column: string;
  /** Operator to apply */
  readonly operator: QueryOperator;
  /** Value to compare */
  readonly value: unknown;
  /** Logical connector (AND/OR) */
  readonly connector?: "AND" | "OR";
}

/**
 * Sort option interface
 */
export interface SortOption {
  /** Column to sort by */
  readonly column: string;
  /** Sort direction */
  readonly direction: SortDirection;
}

/**
 * Pagination options interface
 */
export interface PaginationOptions {
  /** Page number (1-based) */
  readonly page: number;
  /** Number of items per page */
  readonly limit: number;
  /** Total count of items */
  readonly total?: number;
}

/**
 * Paginated result interface
 */
export interface PaginatedResult<T> {
  /** Data items */
  readonly data: T[];
  /** Pagination metadata */
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly pages: number;
    readonly hasNext: boolean;
    readonly hasPrev: boolean;
  };
}

/**
 * Query options interface
 */
export interface QueryOptions {
  /** Conditions to apply */
  readonly conditions?: QueryCondition[];
  /** Sort options */
  readonly sort?: SortOption[];
  /** Pagination options */
  readonly pagination?: PaginationOptions;
  /** Columns to select */
  readonly select?: string[];
  /** Include related data */
  readonly include?: string[];
  /** Group by columns */
  readonly groupBy?: string[];
  /** Having conditions */
  readonly having?: QueryCondition[];
}

/**
 * Aggregate query options interface
 */
export interface AggregateOptions {
  /** Aggregate function to apply */
  readonly function: AggregateFunction;
  /** Column to aggregate */
  readonly column: string;
  /** Alias for the result */
  readonly alias?: string;
  /** Group by columns */
  readonly groupBy?: string[];
  /** Conditions to apply before aggregation */
  readonly where?: QueryCondition[];
  /** Having conditions for grouped results */
  readonly having?: QueryCondition[];
}

/**
 * Query builder wrapper for Drizzle ORM operations
 * Provides a high-level, type-safe query interface
 */
export class DrizzleQueryBuilder {
  private readonly logger: Logger;
  private readonly databaseManager: DatabaseManager;
  private db: BetterSQLite3Database<typeof allTables & typeof allRelations>;

  constructor() {
    this.logger = Logger.create("DrizzleQueryBuilder");
    this.databaseManager = DatabaseManager.getInstance();
    this.db = this.databaseManager.getDatabase();
  }

  /**
   * Build WHERE conditions from query conditions
   */
  private buildWhereConditions(
    conditions: QueryCondition[],
    tableColumns: Record<string, Column>
  ): SQL | undefined {
    if (!conditions.length) return undefined;

    const sqlConditions: SQL[] = [];

    for (const condition of conditions) {
      const column = tableColumns[condition.column];
      if (!column) {
        this.logger.warn(`Column not found: ${condition.column}`);
        continue;
      }

      let sqlCondition: SQL;

      switch (condition.operator) {
        case QueryOperator.EQUALS:
          sqlCondition = eq(column, condition.value);
          break;
        case QueryOperator.NOT_EQUALS:
          sqlCondition = ne(column, condition.value);
          break;
        case QueryOperator.GREATER_THAN:
          sqlCondition = gt(column, condition.value);
          break;
        case QueryOperator.GREATER_THAN_OR_EQUAL:
          sqlCondition = gte(column, condition.value);
          break;
        case QueryOperator.LESS_THAN:
          sqlCondition = lt(column, condition.value);
          break;
        case QueryOperator.LESS_THAN_OR_EQUAL:
          sqlCondition = lte(column, condition.value);
          break;
        case QueryOperator.LIKE:
          sqlCondition = like(column, condition.value as string);
          break;
        case QueryOperator.ILIKE:
          sqlCondition = ilike(column, condition.value as string);
          break;
        case QueryOperator.IS_NULL:
          sqlCondition = isNull(column);
          break;
        case QueryOperator.IS_NOT_NULL:
          sqlCondition = isNotNull(column);
          break;
        case QueryOperator.IN:
          sqlCondition = inArray(column, condition.value as unknown[]);
          break;
        case QueryOperator.NOT_IN:
          sqlCondition = notInArray(column, condition.value as unknown[]);
          break;
        default:
          this.logger.warn(`Unsupported operator: ${condition.operator}`);
          continue;
      }

      sqlConditions.push(sqlCondition);
    }

    // Combine conditions
    if (sqlConditions.length === 0) return undefined;
    if (sqlConditions.length === 1) return sqlConditions[0];

    // Check if we need to use OR logic
    const hasOrConnector = conditions.some(c => c.connector === "OR");
    
    return hasOrConnector 
      ? or(...sqlConditions)
      : and(...sqlConditions);
  }

  /**
   * Build ORDER BY clause from sort options
   */
  private buildOrderBy(
    sortOptions: SortOption[],
    tableColumns: Record<string, Column>
  ): SQL[] {
    const orderBy: SQL[] = [];

    for (const sort of sortOptions) {
      const column = tableColumns[sort.column];
      if (!column) {
        this.logger.warn(`Column not found for sorting: ${sort.column}`);
        continue;
      }

      orderBy.push(
        sort.direction === SortDirection.DESC 
          ? desc(column) 
          : asc(column)
      );
    }

    return orderBy;
  }

  /**
   * Execute a query with options
   */
  public async query<T>(
    table: any,
    options: QueryOptions = {}
  ): Promise<Result<T[], InternalError>> {
    try {
      const startTime = Date.now();

      this.logger.debug("Executing query", {
        table: table._.name,
        options,
      });

      let query = this.db.select().from(table);

      // Apply WHERE conditions
      if (options.conditions?.length) {
        const whereCondition = this.buildWhereConditions(
          options.conditions,
          table._.columns
        );
        if (whereCondition) {
          query = query.where(whereCondition);
        }
      }

      // Apply ORDER BY
      if (options.sort?.length) {
        const orderBy = this.buildOrderBy(options.sort, table._.columns);
        if (orderBy.length) {
          query = query.orderBy(...orderBy);
        }
      }

      // Apply pagination
      if (options.pagination) {
        const offset = (options.pagination.page - 1) * options.pagination.limit;
        query = query.limit(options.pagination.limit).offset(offset);
      }

      const result = await query;
      const executionTime = Date.now() - startTime;

      this.databaseManager.recordQuery(executionTime);

      this.logger.debug("Query executed successfully", {
        table: table._.name,
        resultCount: result.length,
        executionTime,
      });

      return Result.ok(result as T[]);

    } catch (error) {
      this.logger.error("Query execution failed", {
        table: table._.name,
        options,
        error,
      });

      return Result.fail(
        new InternalError(
          "Query execution failed",
          "QUERY_EXECUTION_FAILED",
          error
        )
      );
    }
  }

  /**
   * Execute a paginated query
   */
  public async queryPaginated<T>(
    table: any,
    options: QueryOptions & { pagination: PaginationOptions }
  ): Promise<Result<PaginatedResult<T>, InternalError>> {
    try {
      const startTime = Date.now();

      // Get total count
      let countQuery = this.db.select({ count: count() }).from(table);
      
      if (options.conditions?.length) {
        const whereCondition = this.buildWhereConditions(
          options.conditions,
          table._.columns
        );
        if (whereCondition) {
          countQuery = countQuery.where(whereCondition);
        }
      }

      const [countResult] = await countQuery;
      const total = countResult.count;

      // Get paginated data
      const dataResult = await this.query<T>(table, options);
      
      if (dataResult.isFailure()) {
        return Result.fail(dataResult.error);
      }

      const executionTime = Date.now() - startTime;
      this.databaseManager.recordQuery(executionTime);

      const pages = Math.ceil(total / options.pagination.limit);
      const hasNext = options.pagination.page < pages;
      const hasPrev = options.pagination.page > 1;

      return Result.ok({
        data: dataResult.value,
        pagination: {
          page: options.pagination.page,
          limit: options.pagination.limit,
          total,
          pages,
          hasNext,
          hasPrev,
        },
      });

    } catch (error) {
      this.logger.error("Paginated query execution failed", {
        table: table._.name,
        options,
        error,
      });

      return Result.fail(
        new InternalError(
          "Paginated query execution failed",
          "PAGINATED_QUERY_FAILED",
          error
        )
      );
    }
  }

  /**
   * Execute an aggregate query
   */
  public async aggregate<T>(
    table: any,
    options: AggregateOptions
  ): Promise<Result<T[], InternalError>> {
    try {
      const startTime = Date.now();

      this.logger.debug("Executing aggregate query", {
        table: table._.name,
        options,
      });

      const column = table._.columns[options.column];
      if (!column) {
        return Result.fail(
          new InternalError(
            `Column not found: ${options.column}`,
            "COLUMN_NOT_FOUND"
          )
        );
      }

      let aggregateFunction: SQL;
      switch (options.function) {
        case AggregateFunction.COUNT:
          aggregateFunction = count(column);
          break;
        case AggregateFunction.SUM:
          aggregateFunction = sum(column);
          break;
        case AggregateFunction.AVG:
          aggregateFunction = avg(column);
          break;
        case AggregateFunction.MIN:
          aggregateFunction = min(column);
          break;
        case AggregateFunction.MAX:
          aggregateFunction = max(column);
          break;
        default:
          return Result.fail(
            new InternalError(
              `Unsupported aggregate function: ${options.function}`,
              "UNSUPPORTED_AGGREGATE_FUNCTION"
            )
          );
      }

      const selectObj = options.alias 
        ? { [options.alias]: aggregateFunction }
        : { [options.function]: aggregateFunction };

      let query = this.db.select(selectObj).from(table);

      // Apply WHERE conditions
      if (options.where?.length) {
        const whereCondition = this.buildWhereConditions(
          options.where,
          table._.columns
        );
        if (whereCondition) {
          query = query.where(whereCondition);
        }
      }

      // Apply GROUP BY
      if (options.groupBy?.length) {
        const groupByColumns = options.groupBy
          .map(col => table._.columns[col])
          .filter(Boolean);
        
        if (groupByColumns.length) {
          query = query.groupBy(...groupByColumns);
        }
      }

      // Apply HAVING conditions
      if (options.having?.length) {
        const havingCondition = this.buildWhereConditions(
          options.having,
          table._.columns
        );
        if (havingCondition) {
          query = query.having(havingCondition);
        }
      }

      const result = await query;
      const executionTime = Date.now() - startTime;

      this.databaseManager.recordQuery(executionTime);

      this.logger.debug("Aggregate query executed successfully", {
        table: table._.name,
        function: options.function,
        resultCount: result.length,
        executionTime,
      });

      return Result.ok(result as T[]);

    } catch (error) {
      this.logger.error("Aggregate query execution failed", {
        table: table._.name,
        options,
        error,
      });

      return Result.fail(
        new InternalError(
          "Aggregate query execution failed",
          "AGGREGATE_QUERY_FAILED",
          error
        )
      );
    }
  }

  /**
   * Execute raw SQL query
   */
  public async raw<T>(
    sql: string,
    params: unknown[] = []
  ): Promise<Result<T[], InternalError>> {
    try {
      const startTime = Date.now();

      this.logger.debug("Executing raw SQL query", {
        sql,
        paramCount: params.length,
      });

      const sqlite = this.databaseManager.getSQLiteDatabase();
      const statement = sqlite.prepare(sql);
      const result = statement.all(...params);

      const executionTime = Date.now() - startTime;
      this.databaseManager.recordQuery(executionTime);

      this.logger.debug("Raw SQL query executed successfully", {
        sql,
        resultCount: Array.isArray(result) ? result.length : 1,
        executionTime,
      });

      return Result.ok(result as T[]);

    } catch (error) {
      this.logger.error("Raw SQL query execution failed", {
        sql,
        params,
        error,
      });

      return Result.fail(
        new InternalError(
          "Raw SQL query execution failed",
          "RAW_QUERY_FAILED",
          error
        )
      );
    }
  }

  /**
   * Get query statistics
   */
  public getQueryStats(): {
    readonly totalQueries: number;
    readonly avgExecutionTime: number;
  } {
    return this.databaseManager.getStats();
  }
}