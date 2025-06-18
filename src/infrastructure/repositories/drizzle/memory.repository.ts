// src/infrastructure/repositories/drizzle/memory.repository.ts
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq, desc, like, or, and, sql, inArray } from 'drizzle-orm'; // Added sql and inArray
import { memoryItemsTable, InsertMemoryItem, SelectMemoryItem } from '../../services/drizzle/schemas/memory';
import { MemoryItem } from '../../../core/domain/entities/memory/memory.entity';
import { IMemoryRepository } from '../../../core/ports/repositories/memory.repository';

type DrizzleDB = BetterSQLite3Database<Record<string, any>>;

function dbToDomain(row: SelectMemoryItem): MemoryItem {
  return new MemoryItem({
    id: row.id,
    content: row.content,
    agentId: row.agentId || undefined,
    tags: row.tags || [],
    source: row.source || undefined,
    embedding: row.embedding ? Array.from(new Float32Array(row.embedding.buffer, row.embedding.byteOffset, row.embedding.byteLength / Float32Array.BYTES_PER_ELEMENT)) : undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

function domainToDb(memoryItem: MemoryItem): InsertMemoryItem {
  const props = memoryItem.props;
  return {
    id: props.id,
    content: props.content,
    agentId: props.agentId,
    tags: props.tags.length > 0 ? props.tags : null,
    source: props.source,
    embedding: props.embedding ? Buffer.from(new Float32Array(props.embedding).buffer) : null,
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
    await this.repositoryDB.transaction(async (tx) => {
      const dbData = domainToDb(memoryItem);
      await tx
        .insert(memoryItemsTable)
        .values(dbData)
        .onConflictDoUpdate({
          target: memoryItemsTable.id,
          set: {
            content: dbData.content,
            agentId: dbData.agentId,
            tags: dbData.tags,
            source: dbData.source,
            embedding: dbData.embedding,
            updatedAt: new Date(),
          },
        });
      console.log(\`DrizzleMemoryRepository: Saved memory item \${memoryItem.id} to main table.\`);

      if (dbData.embedding) {
        try {
          // For updates or ensuring no duplicates, delete first then insert.
          await tx.run(sql\`DELETE FROM vss_memory_items WHERE rowid = \${dbData.id}\`);
          await tx.run(sql\`INSERT INTO vss_memory_items (rowid, embedding) VALUES (\${dbData.id}, \${dbData.embedding})\`);
          console.log(\`DrizzleMemoryRepository: Synced embedding for memory item \${memoryItem.id} to VSS table.\`);
        } catch (e: any) {
          console.error(\`DrizzleMemoryRepository: Failed to sync embedding for item \${memoryItem.id} to VSS table. Error: \${e.message}\`);
          // Rethrow to rollback transaction if VSS update is critical.
          throw new Error(\`Failed to sync embedding to VSS table: \${e.message}\`);
        }
      } else {
        // If embedding is null/undefined, ensure it's also removed from VSS table
        try {
            await tx.run(sql\`DELETE FROM vss_memory_items WHERE rowid = \${dbData.id}\`);
            console.log(\`DrizzleMemoryRepository: Removed embedding from VSS for memory item \${memoryItem.id} as it's now null.\`);
        } catch (e: any) {
            console.error(\`DrizzleMemoryRepository: Failed to remove embedding from VSS for item \${memoryItem.id}. Error: \${e.message}\`);
            // Optional: decide if this should also rollback. For now, log and continue.
        }
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.repositoryDB.transaction(async (tx) => {
      const result = await tx
        .delete(memoryItemsTable)
        .where(eq(memoryItemsTable.id, id))
        .returning();

      if (result.length === 0) {
        console.warn(\`DrizzleMemoryRepository: Memory item \${id} not found in main table for deletion.\`);
        return;
      }

      console.log(\`DrizzleMemoryRepository: Deleted memory item \${id} from main table.\`);

      try {
        const vssResult = await tx.run(sql\`DELETE FROM vss_memory_items WHERE rowid = \${id}\`);
        if (vssResult.changes > 0) {
             console.log(\`DrizzleMemoryRepository: Deleted embedding for memory item \${id} from VSS table.\`);
        } else {
             console.warn(\`DrizzleMemoryRepository: Embedding for memory item \${id} not found in VSS table or already deleted.\`);
        }
      } catch (e: any) {
        console.error(\`DrizzleMemoryRepository: Failed to delete embedding for item \${id} from VSS table. Error: \${e.message}\`);
        // If main delete succeeded, perhaps just log this error. For now, log and continue.
      }
    });
  }

  async findByAgentId(agentId: string, limit: number = 20, offset: number = 0): Promise<MemoryItem[]> { // Added method from previous step
    const results = await this.repositoryDB
      .select()
      .from(memoryItemsTable)
      .where(eq(memoryItemsTable.agentId, agentId))
      .orderBy(desc(memoryItemsTable.createdAt))
      .limit(limit)
      .offset(offset);
    return results.map(dbToDomain);
  }

  async search(query: string, tags?: string[], limit: number = 10): Promise<MemoryItem[]> {
    const conditions = [];
    if (query) {
      const queryWords = query.split(' ').filter(w => w.length > 0);
      if (queryWords.length > 0) {
          conditions.push(
              or(...queryWords.map(word => like(memoryItemsTable.content, \`%\${word}%\`)))
          );
      }
    }
    if (tags && tags.length > 0) {
      conditions.push(
          or(...tags.map(tag => like(memoryItemsTable.tags, \`%"\${tag}"%\`)))
      );
    }

    if (conditions.length === 0 && (!tags || tags.length === 0)) {
        if (!query && (!tags || tags.length === 0)) {
            console.log("DrizzleMemoryRepository.search: Empty query and no tags, returning empty array.");
            return [];
        }
        if (conditions.length === 0) return [];
    }

    const results = await this.repositoryDB
      .select().from(memoryItemsTable)
      .where(and(...conditions))
      .orderBy(desc(memoryItemsTable.updatedAt))
      .limit(limit);
    return results.map(dbToDomain);
  }

  async searchSimilar(queryEmbedding: number[], agentId?: string, limit: number = 10): Promise<MemoryItem[]> {
    if (!queryEmbedding || queryEmbedding.length === 0) {
      console.warn("DrizzleMemoryRepository.searchSimilar: Query embedding is empty. Returning empty array.");
      return [];
    }

    const queryEmbeddingBuffer = Buffer.from(new Float32Array(queryEmbedding).buffer);

    // Fetch more if we need to post-filter by agentId, to increase chances of getting 'limit' results for that agent.
    const initialVSFetchLimit = agentId ? limit * 5 : limit;

    const vssQuery = sql\`
      SELECT rowid, distance
      FROM vss_memory_items
      WHERE vss_search(embedding, \${queryEmbeddingBuffer})
      ORDER BY distance
      LIMIT \${initialVSFetchLimit};
    \`;

    console.log(\`DrizzleMemoryRepository.searchSimilar: Executing VSS query. Target limit: \${limit}, agentId: \${agentId ? agentId : 'any'}\`);
    let similarIdsAndDistances: { rowid: string, distance: number }[];
    try {
      similarIdsAndDistances = await this.repositoryDB.all(vssQuery) as { rowid: string, distance: number }[];
    } catch (e: any) {
      console.error(\`DrizzleMemoryRepository.searchSimilar: Error during VSS query: \${e.message}\`);
      if (e.message.includes("no such function: vss_search") || e.message.includes("no such module: vss0")) {
          console.error("CRITICAL: sqlite-vec extension is likely not loaded or vss_memory_items table not created. Semantic search will fail.");
      }
      return [];
    }

    if (!similarIdsAndDistances || similarIdsAndDistances.length === 0) {
      console.log("DrizzleMemoryRepository.searchSimilar: No similar items found by VSS query.");
      return [];
    }

    const similarIds = similarIdsAndDistances.map(item => item.rowid);

    // Fetch these candidates from memoryItemsTable
    const candidateMemoryItemRows = await this.repositoryDB
      .select()
      .from(memoryItemsTable)
      .where(inArray(memoryItemsTable.id, similarIds));

    let domainObjects = candidateMemoryItemRows.map(dbToDomain);

    // If agentId is provided, filter by it
    if (agentId) {
      domainObjects = domainObjects.filter(item => item.agentId === agentId);
    }

    // Re-order based on VSS distance and apply final limit
    const finalResultsMap = new Map(domainObjects.map(item => [item.id, item]));
    const orderedResults: MemoryItem[] = [];
    for (const idAndDist of similarIdsAndDistances) {
      if (orderedResults.length >= limit) break; // Stop if we have enough results
      const item = finalResultsMap.get(idAndDist.rowid);
      if (item) { // Item might have been filtered out by agentId if it wasn't the target agent
        orderedResults.push(item);
      }
    }

    console.log(\`DrizzleMemoryRepository.searchSimilar: Found \${orderedResults.length} similar items after filtering and limit.\`);
    return orderedResults;
  }
}
