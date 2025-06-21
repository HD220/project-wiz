import {
  VectorStore,
  SearchResult,
} from "../../src/infrastructure/vector-store/vector-store.interface";

export class MockVectorStore implements VectorStore {
  private mockResults: SearchResult[] = [];
  private mockEmbedding: number[] = [0.1, 0.2, 0.3];

  setMockResults(results: SearchResult[]): void {
    this.mockResults = results;
  }

  setMockEmbedding(embedding: number[]): void {
    this.mockEmbedding = embedding;
  }

  async embed(text: string): Promise<number[]> {
    return this.mockEmbedding;
  }

  async query(embedding: number[]): Promise<SearchResult[]> {
    return this.mockResults;
  }
}
