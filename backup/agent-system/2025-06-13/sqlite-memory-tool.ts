import {
  MemoryTool,
  MemoryWriteParams,
  MemoryDeleteParams,
  MemoryWriteResult,
  MemoryDeleteResult,
  MemoryRecord,
  MemorySearchOptions,
} from "../../core/ports/tools/memory-tool.interface";
import {
  MemoryWriteParamsSchema,
  MemoryDeleteParamsSchema,
} from "../../core/ports/tools/memory-tool.interface";
import { Database } from "better-sqlite3";
import {
  VectorStore,
  SearchResult,
} from "../vector-store/vector-store.interface";
import { Result } from "../../shared/result";

export class SqliteMemoryTool implements MemoryTool {
  constructor(
    private db: Database,
    private vectorStore: VectorStore
  ) {}

  async write(params: MemoryWriteParams): Promise<MemoryWriteResult> {
    const validation = MemoryWriteParamsSchema.safeParse(params);
    if (!validation.success) {
      throw new Error(`Invalid write params: ${validation.error.message}`);
    }

    const { content, metadata, tags } = validation.data;
    const embedding = await this.vectorStore.embed(content);
    const timestamp = Date.now();
    const id = crypto.randomUUID();

    try {
      this.db
        .prepare(
          `
        INSERT INTO agent_memory (id, content, metadata, tags, timestamp, embedding)
        VALUES (?, ?, ?, ?, ?, ?)
      `
        )
        .run(
          id,
          content,
          JSON.stringify(metadata || {}),
          JSON.stringify(tags || []),
          timestamp,
          JSON.stringify(embedding)
        );

      return {
        success: true,
        id,
        timestamp,
      };
    } catch (error) {
      console.error("Failed to write to memory:", error);
      return {
        success: false,
        id: "",
        timestamp: 0,
      };
    }
  }

  async delete(params: MemoryDeleteParams): Promise<MemoryDeleteResult> {
    const validation = MemoryDeleteParamsSchema.safeParse(params);
    if (!validation.success) {
      throw new Error(`Invalid delete params: ${validation.error.message}`);
    }

    const { id } = validation.data;

    try {
      const result = this.db
        .prepare(
          `
        DELETE FROM agent_memory WHERE id = ?
      `
        )
        .run(id);

      return {
        success: result.changes > 0,
        deletedCount: result.changes,
      };
    } catch (error) {
      console.error("Failed to delete from memory:", error);
      return {
        success: false,
        deletedCount: 0,
      };
    }
  }

  async search(
    query: string,
    options?: MemorySearchOptions
  ): Promise<MemoryRecord[]> {
    const embedding = await this.vectorStore.embed(query);
    const searchResults = await this.vectorStore.query(embedding, {
      limit: options?.limit || 5,
      threshold: options?.threshold || 0.7,
    });

    if (searchResults.length === 0) {
      return [];
    }

    const ids = searchResults.map((r: SearchResult) => r.id);
    const placeholders = ids.map(() => "?").join(",");

    const records = this.db
      .prepare(
        `
      SELECT id, content, metadata, tags, timestamp 
      FROM agent_memory 
      WHERE id IN (${placeholders})
    `
      )
      .all(...ids) as Array<{
      id: string;
      content: string;
      metadata: string;
      tags: string;
      timestamp: number;
    }>;

    return records.map((record) => ({
      id: record.id,
      content: record.content,
      metadata: JSON.parse(record.metadata),
      tags: JSON.parse(record.tags),
      timestamp: record.timestamp,
      relevanceScore: searchResults.find(
        (r: SearchResult) => r.id === record.id
      )?.score,
    }));
  }
}
