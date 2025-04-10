import { PresetLLMConfig } from '../../domain/entities/PresetLLMConfig';

export interface PresetRepositoryPort {
  save(preset: PresetLLMConfig): Promise<void>;
  update(preset: PresetLLMConfig): Promise<void>;
  delete(presetId: string): Promise<void>;
  findById(presetId: string): Promise<PresetLLMConfig | null>;
  findAll(): Promise<PresetLLMConfig[]>;
}