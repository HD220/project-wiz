import { PresetRepositoryPort } from '../ports/PresetRepositoryPort';

export class DeletePresetUseCase {
  constructor(private readonly presetRepository: PresetRepositoryPort) {}

  public async execute(presetId: string): Promise<void> {
    await this.presetRepository.delete(presetId);
  }
}