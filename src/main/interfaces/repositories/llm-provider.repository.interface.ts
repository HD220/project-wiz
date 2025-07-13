import type { LlmProviderSchema, CreateLlmProviderSchema } from '../../persistence/schemas';

export interface ILlmProviderRepository {
  save(data: CreateLlmProviderSchema): Promise<LlmProviderSchema>;
  findById(id: string): Promise<LlmProviderSchema | null>;
  findByName(name: string): Promise<LlmProviderSchema | null>;
  findAll(): Promise<LlmProviderSchema[]>;
  update(id: string, data: Partial<CreateLlmProviderSchema>): Promise<LlmProviderSchema>;
  delete(id: string): Promise<void>;
  findDefault(): Promise<LlmProviderSchema | null>;
  setAsDefault(id: string): Promise<void>;
}