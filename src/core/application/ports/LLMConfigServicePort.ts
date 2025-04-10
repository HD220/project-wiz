import { LLMAdvancedParameters } from '../../domain/value-objects/LLMAdvancedParameters';

export interface LLMConfigServicePort {
  applyGlobalConfig(params: LLMAdvancedParameters): Promise<void>;
  applySessionConfig(sessionId: string, params: LLMAdvancedParameters): Promise<void>;
  resetGlobalConfig(): Promise<void>;
  resetSessionConfig(sessionId: string): Promise<void>;
  getEffectiveConfig(sessionId?: string): Promise<LLMAdvancedParameters>;
}