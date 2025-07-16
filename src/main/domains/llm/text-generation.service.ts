import { CoreMessage } from "ai";

import { ProviderRegistry } from "./provider.registry";

export class TextGenerationService {
  constructor(private readonly registry: ProviderRegistry) {}

  async generateText(
    providerId: string,
    _messages: CoreMessage[],
  ): Promise<string> {
    const model = this.registry.getProvider(providerId);

    if (!model) {
      throw new Error(`Provider ${providerId} not available`);
    }

    // Generation logic simplified
    return "Generated text response";
  }
}
