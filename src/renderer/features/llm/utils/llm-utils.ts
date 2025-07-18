import { FormatUtils, ValidationUtils } from "../shared-utils";

export const LLMUtils = {
  formatTemperature: (temperature: number): string => {
    return FormatUtils.formatDecimal(temperature, 1);
  },

  isValidTemperature: ValidationUtils.isValidTemperature,

  formatMaxTokens: FormatUtils.formatNumber,

  isValidMaxTokens: ValidationUtils.isValidMaxTokens,

  getDefaultConfig: () => ({
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  }),

  formatProviderType: (type: string): string => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  },

  getProviderIcon: (type: string): string => {
    const icons = {
      openai: "🤖",
      claude: "🧠",
      deepseek: "🔬",
      default: "💡",
    };
    return icons[type as keyof typeof icons] || icons.default;
  },
} as const;
