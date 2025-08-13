import { pipeline } from "@xenova/transformers";
import { createDatabaseConnection } from "@/shared/config/database";
import { getLogger } from "@/shared/services/logger/config";

// Create connection with vector extension enabled
const { sqlite } = createDatabaseConnection(true, true);
const logger = getLogger("vector-service");

export class VectorService {
  private static initialized = false;
  private static embeddingPipeline: any = null;

  /**
   * Initialize vec0 virtual table for embeddings and embedding pipeline
   * Extension is already loaded by createDatabaseConnection
   */
  static async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create vector table for memory embeddings using sqlite instance
      // Using 384 dimensions for all-MiniLM-L6-v2 model
      sqlite.exec(`
        CREATE VIRTUAL TABLE IF NOT EXISTS memory_vectors USING vec0(
          memory_id TEXT,
          embedding float[384]
        );
      `);

      // Initialize embedding pipeline with all-MiniLM-L6-v2
      logger.info("Initializing embedding pipeline with all-MiniLM-L6-v2...");
      this.embeddingPipeline = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
      );

      logger.info("Vector service initialized - vec0 table created and embedding pipeline ready");
      this.initialized = true;
    } catch (error) {
      logger.warn(
        "Failed to initialize vector service (continuing without vector support):",
        error,
      );
      // Continue without vector support
      this.initialized = true;
    }
  }

  /**
   * Generate embedding using @xenova/transformers with all-MiniLM-L6-v2
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    await this.init();

    try {
      if (!this.embeddingPipeline) {
        throw new Error("Embedding pipeline not initialized");
      }

      // Generate embedding using all-MiniLM-L6-v2 model
      const output = await this.embeddingPipeline(text, { 
        pooling: "mean", 
        normalize: true 
      });

      // Convert tensor to number array
      const embedding = Array.from(output.data) as number[];

      logger.debug(
        `Generated embedding with ${embedding.length} dimensions for text: "${text.slice(0, 100)}..."`,
      );
      return embedding;
    } catch (error) {
      logger.error("Failed to generate embedding:", error);
      throw error;
    }
  }

  /**
   * Store embedding in vec0 table using SQLite instance
   */
  static async storeEmbedding(
    memoryId: string,
    embedding: number[],
  ): Promise<void> {
    await this.init();

    try {
      // Convert to Float32Array as required by sqlite-vec
      const vectorBuffer = new Float32Array(embedding);

      // Insert into vector table using SQLite instance
      const stmt = sqlite.prepare(`
        INSERT INTO memory_vectors (memory_id, embedding) 
        VALUES (?, ?)
      `);

      stmt.run(memoryId, new Uint8Array(vectorBuffer.buffer));

      logger.debug(
        `Stored embedding for memory: ${memoryId} (${embedding.length} dimensions)`,
      );
    } catch (error) {
      logger.warn(
        `Failed to store embedding for memory ${memoryId} (vector search disabled):`,
        error,
      );
      // Continue without storing embedding
    }
  }

  /**
   * Find similar memories using vec0 similarity search
   */
  static async findSimilar(
    queryEmbedding: number[],
    limit: number = 10,
    minDistance: number = 0.0,
  ): Promise<Array<{ memoryId: string; distance: number }>> {
    await this.init();

    try {
      // Convert to Float32Array as required by sqlite-vec
      const queryBuffer = new Float32Array(queryEmbedding);

      // Perform similarity search using SQLite instance with MATCH operator
      // Based on sqlite-vec official examples: https://github.com/asg017/sqlite-vec/blob/main/examples/simple-deno/demo.ts
      const stmt = sqlite.prepare(`
        SELECT 
          memory_id,
          distance
        FROM memory_vectors 
        WHERE embedding MATCH ?
        ORDER BY distance
        LIMIT ?
      `);

      const results = stmt.all(
        new Uint8Array(queryBuffer.buffer),
        limit,
      ) as Array<{
        memory_id: string;
        distance: number;
      }>;

      // Filter by minimum distance in JavaScript
      const filteredResults = results.filter(result => result.distance >= minDistance);

      logger.debug(
        `Found ${filteredResults.length} similar memories with min distance ${minDistance} (${results.length} total)`,
      );

      return filteredResults.map((row) => ({
        memoryId: row.memory_id,
        distance: row.distance,
      }));
    } catch (error) {
      logger.warn("Vector search disabled, returning empty results:", error);
      return [];
    }
  }

  /**
   * Remove embedding from vec0 table using SQLite instance
   */
  static async removeEmbedding(memoryId: string): Promise<void> {
    await this.init();

    try {
      const stmt = sqlite.prepare(`
        DELETE FROM memory_vectors 
        WHERE memory_id = ?
      `);

      const result = stmt.run(memoryId);

      logger.debug(
        `Removed embedding for memory: ${memoryId} (${result.changes} rows affected)`,
      );
    } catch (error) {
      logger.warn(
        `Failed to remove embedding for memory ${memoryId} (vector search disabled):`,
        error,
      );
      // Continue without removing embedding
    }
  }
}
