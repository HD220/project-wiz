import { ProviderType, ModelConfig } from "../value-objects";

export class LLMProvider {
  constructor(providerType: ProviderType, modelConfig: ModelConfig) {
    this.providerType = providerType;
    this.modelConfig = modelConfig;
  }

  private readonly providerType: ProviderType;
  private readonly modelConfig: ModelConfig;

  getProviderType(): ProviderType {
    return this.providerType;
  }

  getModelConfig(): ModelConfig {
    return this.modelConfig;
  }

  requiresApiKey(): boolean {
    return this.providerType.requiresApiKey();
  }

  isOpenAI(): boolean {
    return this.providerType.isOpenAI();
  }

  isDeepSeek(): boolean {
    return this.providerType.isDeepSeek();
  }

  getTemperature(): number {
    return this.modelConfig.getTemperature().getValue();
  }

  getMaxTokens(): number {
    return this.modelConfig.getMaxTokens().getValue();
  }

  isValidForGeneration(): boolean {
    return true;
  }

  equals(other: LLMProvider): boolean {
    return (
      this.providerType.equals(other.providerType) &&
      this.modelConfig.equals(other.modelConfig)
    );
  }

  updateConfig(config: ModelConfig): LLMProvider {
    return new LLMProvider(this.providerType, config);
  }
}
