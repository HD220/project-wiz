import { PresetRepositoryPort } from '../ports/PresetRepositoryPort';
import { PresetLLMConfig } from '../../domain/entities/PresetLLMConfig';
import { LLMAdvancedParameters } from '../../domain/value-objects/LLMAdvancedParameters';
import { randomUUID } from 'crypto';

export class CreatePresetUseCase {
  constructor(private readonly presetRepository: PresetRepositoryPort) {}

  public async execute(
    name: string,
    description: string,
    parameters: LLMAdvancedParameters
  ): Promise<PresetLLMConfig> {
    const preset = new PresetLLMConfig(
      randomUUID(),
      name,
      description,
      parameters
    );
    await this.presetRepository.save(preset);
    return preset;
  }
}