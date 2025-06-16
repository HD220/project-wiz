// src/infrastructure/repositories/drizzle/memory.repository.ts
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq, desc, like, or, and, inArray } from 'drizzle-orm'; // Add 'like', 'or', 'inArray'
import { memoryItemsTable, InsertMemoryItem, SelectMemoryItem } from '../../services/drizzle/schemas/memory';
import { MemoryItem } from '../../../core/domain/entities/memory/memory.entity';
import { IMemoryRepository } from '../../../core/ports/repositories/memory.repository';

type DrizzleDB = BetterSQLite3Database<Record<string, any>>;

function dbToDomain(row: SelectMemoryItem): MemoryItem {
  return new MemoryItem({
    id: row.id,
    content: row.content,
    tags: row.tags || [],
    source: row.source || undefined,
    embedding: row.embeddingJson ? JSON.parse(row.embeddingJson) : undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

function domainToDb(memoryItem: MemoryItem): InsertMemoryItem {
  const props = memoryItem.props;
  return {
    id: props.id,
    content: props.content,
    tags: props.tags.length > 0 ? props.tags : null,
    source: props.source,
    embeddingJson: props.embedding ? JSON.stringify(props.embedding) : null,
    createdAt: props.createdAt,
    updatedAt: props.updatedAt,
  };
}

export class DrizzleMemoryRepository implements IMemoryRepository {
  private readonly repositoryDB: DrizzleDB;

  constructor(dbInstance: DrizzleDB) {
    this.repositoryDB = dbInstance;
  }

  async findById(id: string): Promise<MemoryItem | null> {
    const result = await this.repositoryDB
      .select().from(memoryItemsTable).where(eq(memoryItemsTable.id, id)).limit(1);
    return result.length ? dbToDomain(result[0]) : null;
  }

  async save(memoryItem: MemoryItem): Promise<void> {
    const dbData = domainToDb(memoryItem);
    await this.repositoryDB
      .insert(memoryItemsTable)
      .values(dbData)
      .onConflictDoUpdate({
        target: memoryItemsTable.id,
        set: {
          content: dbData.content,
          tags: dbData.tags,
          source: dbData.source,
          embeddingJson: dbData.embeddingJson,
          updatedAt: new Date(),
        },
      });
    console.log(\`DrizzleMemoryRepository: Saved memory item \${memoryItem.id}\`);
  }

  async delete(id: string): Promise<void> {
    const result = await this.repositoryDB
      .delete(memoryItemsTable).where(eq(memoryItemsTable.id, id)).returning();
    if (result.length === 0) {
      console.warn(\`DrizzleMemoryRepository: Memory item \${id} not found for deletion.\`);
    } else {
      console.log(\`DrizzleMemoryRepository: Deleted memory item \${id}\`);
    }
  }

  async search(query: string, tags?: string[], limit: number = 10): Promise<MemoryItem[]> {
    const conditions = [];
    if (query) {
      // Simple keyword search: break query into words, search for each in content
      const queryWords = query.split(' ').filter(w => w.length > 0);
      if (queryWords.length > 0) {
          conditions.push(
              or(...queryWords.map(word => like(memoryItemsTable.content, \`%\${word}%\`)))
          );
      }
    }
    if (tags && tags.length > 0) {
      // This is tricky with JSON text field.
      // A common way is to use LIKE for each tag if tags are stored as a simple comma-separated string or specific JSON query functions if DB supports.
      // For SQLite JSON, json_each or similar would be needed for true array search.
      // Simplification: search for each tag as a substring in the JSON string representation of tags.
      // This is NOT robust for exact tag matching but a start.
      // e.g., if tags are ["A", "B"], json is '["A","B"]'. Searching for "A" works. Searching for "AB" might false positive.
      // A better approach would be a separate tags table or full-text search capabilities.
      // For now, using LIKE on the tags JSON string:
      conditions.push(
          or(...tags.map(tag => like(memoryItemsTable.tags, \`%"\${tag}"%\`))) // Search for quoted tag
      );
    }

    if (conditions.length === 0 && (!tags || tags.length === 0)) { // if query is empty and no tags, return empty or all? For now, empty.
        if (!query && (!tags || tags.length === 0)) {
            console.log("DrizzleMemoryRepository.search: Empty query and no tags, returning empty array.");
            return [];
        }
        // If only query is empty but tags are present, or vice-versa, conditions might still be populated.
        // Let's refine: if there are no conditions AT ALL, then return empty.
        if (conditions.length === 0) return [];
    }


    const results = await this.repositoryDB
      .select().from(memoryItemsTable)
      .where(and(...conditions)) // Combine conditions with AND
      .orderBy(desc(memoryItemsTable.updatedAt)) // Or relevance score if implemented
      .limit(limit);
    return results.map(dbToDomain);
  }
}
