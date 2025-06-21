/**
 * Interface para o VectorStore que gerencia embeddings e busca semântica
 */
export interface VectorStore {
  /**
   * Gera embedding para um texto
   * @param text Texto a ser embedado
   * @returns Vetor de números representando o embedding
   */
  embed(text: string): Promise<number[]>;

  /**
   * Busca itens similares no vector store
   * @param embedding Embedding de consulta
   * @param options Opções de busca
   * @returns Lista de resultados com IDs e scores de similaridade
   */
  query(
    embedding: number[],
    options?: { limit?: number; threshold?: number }
  ): Promise<SearchResult[]>;
}

export interface SearchResult {
  id: string;
  score: number;
}
