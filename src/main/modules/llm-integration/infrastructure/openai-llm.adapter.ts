import { ILLMAdapter } from "../domain/llm.adapter";
import { ApplicationError } from "@/main/errors/application.error";

export class OpenAILLMAdapter implements ILLMAdapter {
  async generate(prompt: string): Promise<string> {
    console.log("Generating LLM response for prompt:", prompt);
    try {
      // Placeholder implementation
      return `This is a refined suggestion for: ${prompt}`;
    } catch (error) {
      console.error(
        `Failed to generate LLM response for prompt "${prompt}":`,
        error,
      );
      throw new ApplicationError(
        `Failed to generate LLM response: ${(error as Error).message}`,
      );
    }
  }
}
