import { generateText, CoreMessage } from "ai";

import { getLogger } from "../../infrastructure/logger";

const logger = getLogger("text-generation.processor");

export class TextGenerationProcessor {
  async process(
    model: any,
    messages: CoreMessage[],
    systemPrompt?: string,
  ): Promise<string> {
    const allMessages = this.prepareMessages(messages, systemPrompt);

    const result = await generateText({
      model,
      messages: allMessages,
    });

    this.logGeneration(allMessages, result);
    return result.text;
  }

  private prepareMessages(
    messages: CoreMessage[],
    systemPrompt?: string,
  ): CoreMessage[] {
    if (!systemPrompt) {
      return messages;
    }

    return [{ role: "system", content: systemPrompt }, ...messages];
  }

  private logGeneration(messages: CoreMessage[], result: any): void {
    logger.info("Text generated", {
      messageCount: messages.length,
      responseLength: result.text.length,
    });
  }
}
