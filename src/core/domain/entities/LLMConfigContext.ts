import { LLMAdvancedParameters } from '../value-objects/LLMAdvancedParameters';

export class LLMConfigContext {
  private globalConfig: LLMAdvancedParameters;
  private sessionConfigs: Map<string, LLMAdvancedParameters>;

  constructor(globalConfig: LLMAdvancedParameters) {
    this.globalConfig = globalConfig;
    this.sessionConfigs = new Map();
  }

  public getGlobalConfig(): LLMAdvancedParameters {
    return this.globalConfig;
  }

  public setGlobalConfig(config: LLMAdvancedParameters): void {
    this.globalConfig = config;
  }

  public setSessionConfig(sessionId: string, config: LLMAdvancedParameters): void {
    this.sessionConfigs.set(sessionId, config);
  }

  public resetSessionConfig(sessionId: string): void {
    this.sessionConfigs.delete(sessionId);
  }

  public resetAllSessionConfigs(): void {
    this.sessionConfigs.clear();
  }

  public getEffectiveConfig(sessionId?: string): LLMAdvancedParameters {
    if (sessionId && this.sessionConfigs.has(sessionId)) {
      return this.sessionConfigs.get(sessionId)!;
    }
    return this.globalConfig;
  }
}