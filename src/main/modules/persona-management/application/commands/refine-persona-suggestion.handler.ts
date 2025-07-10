import { RefinePersonaSuggestionCommand } from "./refine-persona-suggestion.command";
import { ILLMAdapter } from "@/main/modules/llm-integration/domain/llm.adapter";

export class RefinePersonaSuggestionHandler {
  constructor(private readonly llmAdapter: ILLMAdapter) {}

  async execute(command: RefinePersonaSuggestionCommand): Promise<string> {
    const { name, description } = command.payload;
    const prompt = `Refine the following persona suggestion:\nName: ${name}\nDescription: ${description}`;
    try {
      return await this.llmAdapter.generate(prompt);
    } catch (error) {
      console.error(
        `Failed to refine persona suggestion for "${name}":`,
        error,
      );
      throw new Error(
        `Failed to refine persona suggestion: ${(error as Error).message}`,
      );
    }
  }
}
