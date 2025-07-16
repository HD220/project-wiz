import { CoreMessage } from "ai";
import { TextGenerationProvider } from "./text-generation-provider";
import { TextGenerationProcessor } from "./text-generation-processor";

export class TextGenerationService {
  constructor() {
    this.provider = new TextGenerationProvider();
    this.processor = new TextGenerationProcessor();
  }

  private readonly provider: TextGenerationProvider;
  private readonly processor: TextGenerationProcessor;

  async generateText(
    providerId: string,
    messages: CoreMessage[],
    systemPrompt?: string,
  ): Promise<string> {
    await this.provider.getOrInitialize(providerId);
    const model = this.provider.getModel(providerId);

    if (!model) {
      throw new Error(`Provider ${providerId} not available`);
    }

    return this.processor.process(model, messages, systemPrompt);
  }

  async getDefaultProvider(): Promise<string | null> {
    return this.provider.getDefaultProvider();
  }
}
