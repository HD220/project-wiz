import { z } from "zod";

/**
 * Interface para a MemoryTool que gerencia a memória persistente do agente
 * Seguindo os princípios da Clean Architecture
 */
export interface MemoryTool {
  /**
   * Escreve um registro na memória do agente
   * @param params Parâmetros para escrita
   * @returns Resultado da operação com o ID do registro
   */
  write(params: MemoryWriteParams): Promise<MemoryWriteResult>;

  /**
   * Remove um registro da memória do agente
   * @param params Parâmetros para remoção
   * @returns Resultado da operação
   */
  delete(params: MemoryDeleteParams): Promise<MemoryDeleteResult>;

  /**
   * Busca registros na memória usando busca semântica (RAG)
   * @param query Consulta de busca
   * @param options Opções de busca
   * @returns Registros relevantes encontrados
   */
  search(query: string, options?: MemorySearchOptions): Promise<MemoryRecord[]>;
}

// Schemas Zod para validação dos parâmetros
export const MemoryWriteParamsSchema = z.object({
  content: z.string().min(1, "O conteúdo não pode estar vazio"),
  metadata: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
});

export type MemoryWriteParams = z.infer<typeof MemoryWriteParamsSchema>;

export const MemoryWriteResultSchema = z.object({
  success: z.boolean(),
  id: z.string(),
  timestamp: z.number(),
});

export type MemoryWriteResult = z.infer<typeof MemoryWriteResultSchema>;

export const MemoryDeleteParamsSchema = z.object({
  id: z.string().min(1, "O ID não pode estar vazio"),
});

export type MemoryDeleteParams = z.infer<typeof MemoryDeleteParamsSchema>;

export const MemoryDeleteResultSchema = z.object({
  success: z.boolean(),
  deletedCount: z.number(),
});

export type MemoryDeleteResult = z.infer<typeof MemoryDeleteResultSchema>;

export interface MemorySearchOptions {
  limit?: number;
  threshold?: number;
}

export interface MemoryRecord {
  id: string;
  content: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
  timestamp: number;
  relevanceScore?: number;
}
