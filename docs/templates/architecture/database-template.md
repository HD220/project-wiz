---
template_type: "architecture"
complexity: "medium"
primary_agent: "solution-architect"
estimated_time: "1-2 hours"
related_patterns:
  - "docs/developer/database-patterns.md"
  - "docs/developer/code-simplicity-principles.md"
---

# Database Architecture: [DATABASE_FEATURE_NAME]

**Date:** [DATE]  
**Version:** [VERSION]  
**Status:** [Draft/In Review/Approved/Implemented]  
**Authors:** [AUTHOR_NAME], Claude Code  
**Database Type:** SQLite with Drizzle ORM

## Executive Summary

### Database Change Overview

[Describe the database architecture change being designed - new tables, schema modifications, performance optimizations, etc.]

### Key Database Components

- [Component 1: New table/schema]
- [Component 2: Index strategy]
- [Component 3: Migration approach]

### Success Criteria

- [Success criterion 1]
- [Success criterion 2]
- [Success criterion 3]

## Context and Requirements

### Business Context

[Explain the business need for this database change and how it supports Project Wiz's data requirements.]

### Database Scope

**In Scope:**

- [Table/schema 1 to be created/modified]
- [Index optimization 2]
- [Migration strategy 3]

**Out of Scope:**

- [Database feature 1 explicitly excluded]
- [Optimization 2 for future consideration]
- [Migration 3 handled separately]

### Project Wiz Database Context

[Explain how this change fits within Project Wiz's database architecture:]

- **SQLite + WAL Mode:** [How this leverages SQLite capabilities]
- **Drizzle ORM Patterns:** [Alignment with existing ORM usage]
- **INLINE-FIRST Impact:** [How database code follows inline-first principles]
- **Desktop App Constraints:** [Local database considerations and limitations]

## Current Database State

### Existing Schema Analysis

[Analyze current database structure relevant to this change:]

```typescript
// Current relevant tables
export const existingTable = sqliteTable("existing_table", {
  id: text("id").primaryKey(),
  // ... current schema
});
```

### Current Limitations

- [Performance bottleneck 1 with specific metrics]
- [Schema limitation 2 affecting functionality]
- [Data integrity issue 3 with examples]

### Query Performance Analysis

```sql
-- Current problematic queries
EXPLAIN QUERY PLAN
SELECT * FROM existing_table
WHERE frequently_queried_field = ?;
-- Result: SCAN TABLE (no index) - 50ms average
```

## Proposed Database Design

### Schema Design

#### New Tables

```typescript
// New table following Project Wiz patterns
export const [newTableName]Table = sqliteTable(
  '[new_table_name]',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    [fieldName]: text('[field_name]').notNull(),
    [optionalField]: text('[optional_field]'),
    [foreignKeyField]: text('[foreign_key_field]')
      .notNull()
      .references(() => [referencedTable].id, { onDelete: 'cascade' }),
    [enumField]: text('[enum_field]').$type<[CustomEnumType]>().notNull(),

    // MANDATORY: Timestamp columns
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    // MANDATORY: Indexes for foreign keys and common queries
    [foreignKeyField]Idx: index('[table]_[foreign_key]_idx').on(table.[foreignKeyField]),
    [commonQueryField]Idx: index('[table]_[common_field]_idx').on(table.[commonQueryField]),

    // Composite indexes for multi-column queries
    [compositeField]Idx: index('[table]_composite_idx').on(
      table.[field1],
      table.[field2]
    ),

    // Full-text search index (if needed)
    [searchField]Idx: index('[table]_search_idx').on(table.[searchableField]),
  }),
);

// Type inference (NEVER recreate manually)
export type Select[EntityName] = typeof [newTableName]Table.$inferSelect;
export type Insert[EntityName] = typeof [newTableName]Table.$inferInsert;
export type Update[EntityName] = Partial<Insert[EntityName]> & { id: string };
```

#### Modified Existing Tables

```typescript
// Schema modifications to existing tables
export const existingTableModified = sqliteTable(
  'existing_table',
  {
    // ... existing fields

    // New fields (nullable for backward compatibility)
    [newField]: text('[new_field]'), // Nullable to avoid migration issues
    [anotherField]: text('[another_field]').default('[default_value]'),

    // Updated field constraints (careful with existing data)
    [existingField]: text('[existing_field]').notNull(), // Only if migration handles nulls
  },
  (table) => ({
    // ... existing indexes

    // New indexes for performance
    [newField]Idx: index('existing_table_[new_field]_idx').on(table.[newField]),
  }),
);
```

### Custom Types and Enums

```typescript
// Custom types for type safety
export type [EntityStatus] = 'active' | 'inactive' | 'archived' | 'deleted';
export type [EntityType] = 'type1' | 'type2' | 'type3';
export type [Priority] = 'low' | 'medium' | 'high' | 'critical';

// Validation schemas (Zod)
export const [EntityName]StatusSchema = z.enum(['active', 'inactive', 'archived', 'deleted']);
export const [EntityName]TypeSchema = z.enum(['type1', 'type2', 'type3']);

// Complex types for JSON fields
export interface [ComplexDataType] {
  setting1: boolean;
  setting2: number;
  setting3: string[];
  metadata?: Record<string, any>;
}

export const [ComplexDataType]Schema = z.object({
  setting1: z.boolean(),
  setting2: z.number().min(0).max(100),
  setting3: z.array(z.string()),
  metadata: z.record(z.any()).optional(),
});
```

### Relationship Design

```typescript
// One-to-Many relationship
export const parentTable = sqliteTable("parent_table", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

export const childTable = sqliteTable(
  "child_table",
  {
    id: text("id").primaryKey(),
    parentId: text("parent_id")
      .notNull()
      .references(() => parentTable.id, { onDelete: "cascade" }),
    data: text("data").notNull(),
  },
  (table) => ({
    parentIdIdx: index("child_table_parent_id_idx").on(table.parentId),
  }),
);

// Many-to-Many relationship (junction table)
export const entityATable = sqliteTable("entity_a", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

export const entityBTable = sqliteTable("entity_b", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

export const entityABTable = sqliteTable(
  "entity_a_b",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    entityAId: text("entity_a_id")
      .notNull()
      .references(() => entityATable.id, { onDelete: "cascade" }),
    entityBId: text("entity_b_id")
      .notNull()
      .references(() => entityBTable.id, { onDelete: "cascade" }),

    // Additional relationship metadata
    relationshipType: text("relationship_type").$type<[RelationshipType]>(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    entityAIdIdx: index("entity_a_b_entity_a_id_idx").on(table.entityAId),
    entityBIdIdx: index("entity_a_b_entity_b_id_idx").on(table.entityBId),

    // Unique constraint for relationship
    uniqueRelationship: uniqueIndex("entity_a_b_unique").on(
      table.entityAId,
      table.entityBId,
    ),
  }),
);
```

## Migration Strategy

### Migration Planning

**CRITICAL: Never edit SQL migration files directly - they are auto-generated**

```bash
# Migration workflow
# 1. Modify *.model.ts files
# 2. Generate migration
npm run db:generate
# 3. Review generated migration
# 4. Apply migration
npm run db:migrate
```

### Backward Compatibility Considerations

```typescript
// Safe migration patterns

// ✅ SAFE: Adding nullable columns
export const safeAddition = sqliteTable("existing_table", {
  // ... existing fields
  newOptionalField: text("new_optional_field"), // NULL allowed
});

// ✅ SAFE: Adding columns with defaults
export const safeWithDefault = sqliteTable("existing_table", {
  // ... existing fields
  newFieldWithDefault: text("new_field_with_default").default("default_value"),
});

// ❌ DANGEROUS: Adding non-null columns without defaults
export const dangerousAddition = sqliteTable("existing_table", {
  // ... existing fields
  newRequiredField: text("new_required_field").notNull(), // Will fail for existing records
});

// ✅ SAFE ALTERNATIVE: Add nullable first, then populate and make required in separate migration
// Migration 1: Add nullable column
export const step1 = sqliteTable("existing_table", {
  // ... existing fields
  newField: text("new_field"), // Nullable initially
});

// Migration 2: Populate data (via custom migration script)
// Migration 3: Make required
export const step3 = sqliteTable("existing_table", {
  // ... existing fields
  newField: text("new_field").notNull(), // Now safe to make required
});
```

### Data Migration Scripts

```typescript
// Custom data migration (when needed)
export async function migrate[FeatureName]Data(): Promise<void> {
  const db = getDatabase();

  // INLINE-FIRST: Simple data migration logic
  const recordsToMigrate = await db
    .select()
    .from([sourceTable])
    .where(isNull([sourceTable].[newField]));

  for (const record of recordsToMigrate) {
    // Transform data (inline if < 15 lines)
    const transformedValue = record.[oldField]
      ? transformOldValue(record.[oldField])
      : '[default_value]';

    await db
      .update([sourceTable])
      .set({ [newField]: transformedValue })
      .where(eq([sourceTable].id, record.id));
  }

  console.log(`Migrated ${recordsToMigrate.length} records`);
}
```

## Service Layer Integration

### Database Service Patterns

```typescript
// Service following Project Wiz INLINE-FIRST patterns
export class [EntityName]Service {
  static async create(input: Insert[EntityName]): Promise<Select[EntityName]> {
    const db = getDatabase();

    // INLINE-FIRST: Validation + business logic + database operation
    const validated = [EntityName]CreateSchema.parse(input);

    // Check constraints (inline if < 15 lines)
    if (validated.[constraintField]) {
      const [existing] = await db
        .select()
        .from([tableName]Table)
        .where(eq([tableName]Table.[constraintField], validated.[constraintField]))
        .limit(1);

      if (existing) {
        throw new Error(`[EntityName] with [constraintField] '${validated.[constraintField]}' already exists`);
      }
    }

    // Database operation with returning
    const [newEntity] = await db
      .insert([tableName]Table)
      .values({
        ...validated,
        id: crypto.randomUUID(),
      })
      .returning();

    if (!newEntity) {
      throw new Error('Failed to create [EntityName]');
    }

    return newEntity;
  }

  static async getById(id: string): Promise<Select[EntityName]> {
    const db = getDatabase();

    const [entity] = await db
      .select()
      .from([tableName]Table)
      .where(eq([tableName]Table.id, id))
      .limit(1);

    if (!entity) {
      throw new Error(`[EntityName] with ID ${id} not found`);
    }

    return entity;
  }

  static async list(filters: [EntityName]Filters): Promise<Select[EntityName][]> {
    const db = getDatabase();

    let query = db
      .select()
      .from([tableName]Table);

    // INLINE-FIRST: Filter logic (< 15 lines total)
    if (filters.status) {
      query = query.where(eq([tableName]Table.status, filters.status));
    }

    if (filters.search) {
      query = query.where(
        or(
          like([tableName]Table.name, `%${filters.search}%`),
          like([tableName]Table.description, `%${filters.search}%`)
        )
      );
    }

    if (filters.parentId) {
      query = query.where(eq([tableName]Table.parentId, filters.parentId));
    }

    return await query
      .orderBy(desc([tableName]Table.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);
  }

  static async update(
    id: string,
    input: Partial<Insert[EntityName]>
  ): Promise<Select[EntityName]> {
    const db = getDatabase();

    // Validation
    const validated = [EntityName]UpdateSchema.parse(input);

    const [updatedEntity] = await db
      .update([tableName]Table)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq([tableName]Table.id, id))
      .returning();

    if (!updatedEntity) {
      throw new Error(`Failed to update [EntityName] with ID ${id}`);
    }

    return updatedEntity;
  }

  static async delete(id: string): Promise<void> {
    const db = getDatabase();

    const result = await db
      .delete([tableName]Table)
      .where(eq([tableName]Table.id, id));

    if (result.changes === 0) {
      throw new Error(`[EntityName] with ID ${id} not found`);
    }
  }
}
```

### Complex Query Patterns

```typescript
// Complex queries with joins
export class [EntityName]QueryService {
  static async get[EntityName]WithRelations(id: string): Promise<[EntityName]WithRelations> {
    const db = getDatabase();

    // Complex query with proper selection
    const [result] = await db
      .select({
        entity: {
          id: [tableName]Table.id,
          name: [tableName]Table.name,
          status: [tableName]Table.status,
          createdAt: [tableName]Table.createdAt,
        },
        parent: {
          id: parentTable.id,
          name: parentTable.name,
        },
        children: {
          count: count(childTable.id),
        },
      })
      .from([tableName]Table)
      .leftJoin(parentTable, eq([tableName]Table.parentId, parentTable.id))
      .leftJoin(childTable, eq(childTable.parentId, [tableName]Table.id))
      .where(eq([tableName]Table.id, id))
      .groupBy([tableName]Table.id, parentTable.id)
      .limit(1);

    if (!result) {
      throw new Error(`[EntityName] with ID ${id} not found`);
    }

    return result;
  }

  static async search[EntityName]s(searchQuery: string): Promise<Select[EntityName][]> {
    const db = getDatabase();

    // Full-text search pattern
    return await db
      .select()
      .from([tableName]Table)
      .where(
        or(
          like([tableName]Table.name, `%${searchQuery}%`),
          like([tableName]Table.description, `%${searchQuery}%`),
          like([tableName]Table.tags, `%${searchQuery}%`)
        )
      )
      .orderBy(
        // Relevance scoring (simple)
        sql`CASE
          WHEN ${[tableName]Table.name} LIKE ${`%${searchQuery}%`} THEN 1
          WHEN ${[tableName]Table.description} LIKE ${`%${searchQuery}%`} THEN 2
          ELSE 3
        END`,
        desc([tableName]Table.createdAt)
      )
      .limit(20);
  }
}
```

## Performance Optimization

### Index Strategy

```typescript
// Comprehensive indexing for performance
export const [tableName]Table = sqliteTable(
  '[table_name]',
  {
    // ... table definition
  },
  (table) => ({
    // PRIMARY INDEXES (always include these)

    // Foreign key indexes (MANDATORY)
    parentIdIdx: index('[table]_parent_id_idx').on(table.parentId),
    ownerIdIdx: index('[table]_owner_id_idx').on(table.ownerId),

    // Query optimization indexes
    statusIdx: index('[table]_status_idx').on(table.status),
    createdAtIdx: index('[table]_created_at_idx').on(table.createdAt),

    // COMPOSITE INDEXES (for multi-column queries)

    // Status + Date composite (for filtered lists)
    statusCreatedIdx: index('[table]_status_created_idx').on(
      table.status,
      table.createdAt
    ),

    // Parent + Status composite (for hierarchical filtering)
    parentStatusIdx: index('[table]_parent_status_idx').on(
      table.parentId,
      table.status
    ),

    // SEARCH INDEXES

    // Text search optimization
    nameIdx: index('[table]_name_idx').on(table.name),

    // UNIQUE CONSTRAINTS

    // Business rule enforcement
    uniqueConstraint: uniqueIndex('[table]_unique_constraint').on(
      table.parentId,
      table.name
    ),
  }),
);
```

### Query Performance Analysis

```sql
-- Performance testing queries
EXPLAIN QUERY PLAN
SELECT * FROM [table_name]
WHERE parent_id = ? AND status = 'active'
ORDER BY created_at DESC
LIMIT 20;

-- Expected: Using index [table]_parent_status_idx

EXPLAIN QUERY PLAN
SELECT COUNT(*) FROM [table_name]
WHERE status = 'active' AND created_at > ?;

-- Expected: Using index [table]_status_created_idx
```

### Database Configuration Optimization

```typescript
// SQLite optimization for Project Wiz
export function optimizeDatabaseConnection(db: Database): void {
  // MANDATORY: WAL mode for better concurrency
  db.pragma("journal_mode = WAL");

  // MANDATORY: Enable foreign keys
  db.pragma("foreign_keys = ON");

  // Performance optimizations
  db.pragma("synchronous = NORMAL"); // Balance safety/performance
  db.pragma("cache_size = 10000"); // 10MB cache
  db.pragma("temp_store = memory"); // Use memory for temp tables
  db.pragma("mmap_size = 268435456"); // 256MB memory-mapped I/O

  // Analysis and maintenance
  db.pragma("optimize"); // SQLite query optimizer

  // Periodic maintenance (run occasionally)
  // db.exec('VACUUM;');                   // Reclaim space
  // db.exec('ANALYZE;');                  // Update statistics
}
```

## Testing Strategy

### Database Testing Setup

```typescript
// Test database setup
export async function setupTestDatabase(): Promise<BetterSQLite3Database> {
  const testDb = new Database(':memory:'); // In-memory for tests
  testDb.pragma('journal_mode = WAL');
  testDb.pragma('foreign_keys = ON');

  const drizzleDb = drizzle(testDb);

  // Run migrations
  await migrate(drizzleDb, { migrationsFolder: './migrations' });

  return drizzleDb;
}

// Test data factory
export function create[EntityName]TestData(overrides: Partial<Insert[EntityName]> = {}): Insert[EntityName] {
  return {
    name: 'Test [EntityName]',
    status: 'active',
    description: 'Test description',
    ...overrides,
  };
}
```

### Service Testing

```typescript
describe('[EntityName]Service', () => {
  let testDb: BetterSQLite3Database;

  beforeEach(async () => {
    testDb = await setupTestDatabase();
  });

  afterEach(async () => {
    // Clean up test data
    await testDb.delete([tableName]Table);
  });

  describe('create', () => {
    it('should create [entity] successfully', async () => {
      const input = create[EntityName]TestData();

      const result = await [EntityName]Service.create(input);

      expect(result).toMatchObject({
        name: input.name,
        status: input.status,
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should enforce unique constraints', async () => {
      const input = create[EntityName]TestData({ name: 'Duplicate Name' });

      await [EntityName]Service.create(input);

      await expect([EntityName]Service.create(input))
        .rejects.toThrow('already exists');
    });
  });

  describe('query performance', () => {
    beforeEach(async () => {
      // Create test data for performance testing
      const testData = Array.from({ length: 100 }, (_, i) =>
        create[EntityName]TestData({ name: `Test ${i}` })
      );

      for (const data of testData) {
        await [EntityName]Service.create(data);
      }
    });

    it('should query with acceptable performance', async () => {
      const startTime = Date.now();

      const results = await [EntityName]Service.list({
        status: 'active',
        limit: 20,
      });

      const queryTime = Date.now() - startTime;

      expect(results).toHaveLength(20);
      expect(queryTime).toBeLessThan(50); // Query should complete in < 50ms
    });
  });
});
```

### Migration Testing

```typescript
describe('Database Migrations', () => {
  it('should run migrations without errors', async () => {
    const testDb = new Database(':memory:');
    const drizzleDb = drizzle(testDb);

    await expect(
      migrate(drizzleDb, { migrationsFolder: './migrations' })
    ).resolves.not.toThrow();
  });

  it('should maintain data integrity after migration', async () => {
    // Test that existing data survives migration
    const testDb = await setupTestDatabase();

    // Create test data before migration
    const testEntity = await [EntityName]Service.create(
      create[EntityName]TestData()
    );

    // Run new migration (if applicable)
    // await migrate(testDb, { migrationsFolder: './new-migrations' });

    // Verify data still exists and is valid
    const retrievedEntity = await [EntityName]Service.getById(testEntity.id);
    expect(retrievedEntity).toMatchObject(testEntity);
  });
});
```

## Monitoring and Maintenance

### Database Health Monitoring

```typescript
// Database health check
export class DatabaseHealthService {
  static async checkHealth(): Promise<{
    status: "healthy" | "warning" | "error";
    metrics: DatabaseMetrics;
    issues: string[];
  }> {
    const db = getDatabase();
    const issues: string[] = [];

    try {
      // Check basic connectivity
      const [result] = await db
        .select()
        .from(sql`SELECT 1 as test`)
        .limit(1);
      if (!result) throw new Error("Database connectivity failed");

      // Check database size
      const [sizeResult] = await db
        .select()
        .from(
          sql`SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()`,
        );
      const dbSizeBytes = sizeResult?.size || 0;

      // Check WAL mode
      const [walResult] = await db.select().from(sql`PRAGMA journal_mode`);
      if (walResult?.journal_mode !== "wal") {
        issues.push("Database not in WAL mode");
      }

      // Check foreign keys
      const [fkResult] = await db.select().from(sql`PRAGMA foreign_keys`);
      if (!fkResult?.foreign_keys) {
        issues.push("Foreign keys not enabled");
      }

      const metrics = {
        databaseSizeBytes: dbSizeBytes,
        walMode: walResult?.journal_mode === "wal",
        foreignKeysEnabled: Boolean(fkResult?.foreign_keys),
      };

      const status = issues.length === 0 ? "healthy" : "warning";

      return { status, metrics, issues };
    } catch (error) {
      return {
        status: "error",
        metrics: {} as DatabaseMetrics,
        issues: [`Database health check failed: ${error.message}`],
      };
    }
  }
}
```

### Performance Monitoring

```typescript
// Query performance monitoring
export class DatabasePerformanceMonitor {
  private static queryStats = new Map<
    string,
    {
      count: number;
      totalTime: number;
      maxTime: number;
      errors: number;
    }
  >();

  static recordQuery(
    queryName: string,
    executionTime: number,
    success: boolean,
  ): void {
    const stats = this.queryStats.get(queryName) || {
      count: 0,
      totalTime: 0,
      maxTime: 0,
      errors: 0,
    };

    stats.count++;
    stats.totalTime += executionTime;
    stats.maxTime = Math.max(stats.maxTime, executionTime);

    if (!success) {
      stats.errors++;
    }

    this.queryStats.set(queryName, stats);
  }

  static getPerformanceReport(): Record<string, any> {
    const report: Record<string, any> = {};

    for (const [queryName, stats] of this.queryStats.entries()) {
      report[queryName] = {
        averageTime: stats.totalTime / stats.count,
        maxTime: stats.maxTime,
        totalExecutions: stats.count,
        errorRate: stats.errors / stats.count,
      };
    }

    return report;
  }
}
```

## Implementation Checklist

### Pre-Implementation

- [ ] Database requirements clearly defined
- [ ] Current schema limitations identified
- [ ] Performance bottlenecks analyzed
- [ ] Migration strategy planned
- [ ] Backward compatibility considered

### Implementation Phase 1: Schema Design

- [ ] New tables designed following Project Wiz patterns
- [ ] Type definitions created with proper inference
- [ ] Validation schemas implemented with Zod
- [ ] Index strategy defined and implemented
- [ ] Foreign key constraints properly configured

### Implementation Phase 2: Migration

- [ ] Migration files generated (never edited manually)
- [ ] Migration tested on copy of production data
- [ ] Rollback strategy prepared
- [ ] Data migration scripts created (if needed)
- [ ] Performance impact assessed

### Implementation Phase 3: Service Layer

- [ ] Service methods implemented following INLINE-FIRST
- [ ] Complex queries optimized with proper indexing
- [ ] Error handling implemented consistently
- [ ] Transaction patterns applied where needed
- [ ] Query performance validated

### Implementation Phase 4: Testing

- [ ] Unit tests written for all service methods
- [ ] Migration tests implemented
- [ ] Performance tests created with benchmarks
- [ ] Integration tests with IPC layer completed
- [ ] Error scenario testing completed

### Post-Implementation

- [ ] Database health monitoring configured
- [ ] Performance monitoring implemented
- [ ] Documentation updated
- [ ] Team training on new patterns completed

## References

### Project Wiz Documentation

- [Database Patterns](../../developer/database-patterns.md)
- [Code Simplicity Principles](../../developer/code-simplicity-principles.md)
- [IPC Communication Patterns](../../developer/ipc-communication-patterns.md)

### Technical References

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [SQLite Performance Tuning](https://www.sqlite.org/optoverview.html)

### Related Architectural Documents

- [Related ADRs affecting database design]
- [System architecture documents]
- [Integration specifications requiring database changes]

---

## Template Usage Notes

**For Claude Code Agents:**

1. Replace all `[PLACEHOLDER]` text with database-specific content
2. Include actual table names and field definitions from Project Wiz
3. Reference specific performance requirements and constraints
4. Ensure all patterns follow Project Wiz database guidelines
5. Test migration strategies thoroughly before implementation

**File Naming Convention:** `database-[feature-name].md`  
**Location:** Save completed database designs in `docs/architecture/database/`
