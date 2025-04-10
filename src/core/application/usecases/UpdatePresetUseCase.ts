import { PresetRepositoryPort } from '../ports/PresetRepositoryPort';
import { LLMAdvancedParameters } from '../../domain/value-objects/LLMAdvancedParameters';
import { PresetLLMConfig } from '../../domain/entities/PresetLLMConfig';

export class UpdatePresetUseCase {
  constructor(private readonly presetRepository: PresetRepositoryPort) {}

  public async execute(
    presetId: string,
    name: string,
    description: string,
    parameters: LLMAdvancedParameters
  ): Promise<PresetLLMConfig> {
    const preset = await this.presetRepository.findById(presetId);
    if (!preset) {
      throw new Error('Preset não encontrado');
    }
    preset.setName(name);
    preset.setDescription(description);
    preset.setParameters(parameters);
    await this.presetRepository.update(preset);
    return preset;
  }
}