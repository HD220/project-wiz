import { default as BetterSqlite3 } from "better-sqlite3";
import { vi } from "vitest";

interface VectorStore {
  embed(text: string): Promise<number[]>;
  query(
    embedding: number[],
    options?: { limit?: number; threshold?: number }
  ): Promise<SearchResult[]>;
}

interface SearchResult {
  id: string;
  score: number;
}

/**
 * Cria um banco de dados SQLite em memória para testes
 */
export function createTestDatabase(): BetterSqlite3.Database {
  const db = new BetterSqlite3(":memory:");
  // Habilita verificação de chaves estrangeiras
  db.pragma("foreign_keys = ON");
  return db;
}

/**
 * Cria um mock básico do VectorStore para testes
 */
export function createMockVectorStore(): {
  vectorStore: VectorStore;
  mockEmbed: ReturnType<typeof vi.fn>;
  mockQuery: ReturnType<typeof vi.fn>;
} {
  const mockEmbed = vi
    .fn()
    .mockImplementation((text: string) => Promise.resolve([0.1, 0.2, 0.3]));

  const mockQuery = vi
    .fn()
    .mockImplementation(() => Promise.resolve([{ id: "test-id", score: 0.9 }]));

  const vectorStore: VectorStore = {
    embed: mockEmbed,
    query: mockQuery,
  };

  return { vectorStore, mockEmbed, mockQuery };
}
