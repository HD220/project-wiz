export class LlmProviderNotFoundError extends Error {
  constructor(providerId: string) {
    super(`LLM provider with id '${providerId}' not found`);
    this.name = "LlmProviderNotFoundError";
  }
}

export class LlmProviderUnavailableError extends Error {
  constructor(providerId: string) {
    super(`Provider ${providerId} not available`);
    this.name = "LlmProviderUnavailableError";
  }
}

export class LlmProviderConfigurationError extends Error {
  constructor(providerType: string, message: string) {
    super(`Configuration error for ${providerType}: ${message}`);
    this.name = "LlmProviderConfigurationError";
  }
}

export class LlmTextGenerationError extends Error {
  constructor(message: string) {
    super(`Text generation failed: ${message}`);
    this.name = "LlmTextGenerationError";
  }
}

export class LlmModelNotSupportedError extends Error {
  constructor(modelId: string, providerType: string) {
    super(`Model ${modelId} not supported by provider ${providerType}`);
    this.name = "LlmModelNotSupportedError";
  }
}
