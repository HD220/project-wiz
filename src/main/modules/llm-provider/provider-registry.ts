import { LlmProvider } from './domain/llm-provider.entity';

export const PROVIDER_REGISTRY = new Map<string, Partial<LlmProvider>>([
  [
    'Claude 3 Opus',
    {
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      model: 'claude-3-opus-20240229',
    },
  ],
  [
    'Claude 3 Sonnet',
    {
      name: 'Claude 3 Sonnet',
      provider: 'anthropic',
      model: 'claude-3-sonnet-20240229',
    },
  ],
  [
    'Claude 3 Haiku',
    {
      name: 'Claude 3 Haiku',
      provider: 'anthropic',
      model: 'claude-3-haiku-20240307',
    },
  ],
]);
