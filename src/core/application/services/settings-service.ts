import { SettingsRepositoryPort } from '../ports/SettingsRepositoryPort';

export class SettingsService {
  constructor(private readonly settingsRepository: SettingsRepositoryPort) {}

  async getMaxPromptsPerUser(): Promise<number> {
    return (
      (await this.settingsRepository.getSetting<number>('maxPromptsPerUser')) ??
      100
    );
  }

  async getMaxPromptContentLength(): Promise<number> {
    return (
      (await this.settingsRepository.getSetting<number>('maxPromptContentLength')) ??
      10000
    );
  }

  async getMaxVariablesPerPrompt(): Promise<number> {
    return (
      (await this.settingsRepository.getSetting<number>('maxVariablesPerPrompt')) ??
      20
    );
  }

  async getForbiddenWords(): Promise<string[]> {
    return (
      (await this.settingsRepository.getSetting<string[]>('forbiddenWords')) ?? [
        'senha',
        'password',
        'token',
        'chave-secreta',
      ]
    );
  }
}