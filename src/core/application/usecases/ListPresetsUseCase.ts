import { PresetRepositoryPort } from '../ports/PresetRepositoryPort';
import { PresetLLMConfig } from '../../domain/entities/PresetLLMConfig';

export class ListPresetsUseCase {
  constructor(private readonly presetRepository: PresetRepositoryPort) {}

  public async execute(): Promise<PresetLLMConfig[]> {
    return this.presetRepository.findAll();
  }
}