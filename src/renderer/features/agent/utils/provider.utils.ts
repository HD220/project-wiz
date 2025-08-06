export const getProviderLabel = (type: string): string => {
  const labels: Record<string, string> = {
    openai: "OpenAI",
    deepseek: "DeepSeek",
    anthropic: "Anthropic",
    google: "Google",
    custom: "Custom",
  };
  return labels[type] || "Unknown";
};
