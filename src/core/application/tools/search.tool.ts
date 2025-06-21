import { ITool } from "./tool.interface";
import { Result, ok } from "../../../shared/result";

export class SearchTool implements ITool {
  name: string = "SearchTool";
  description: string = "A tool for performing web searches.";

  async execute(input: string): Promise<Result<string>> {
    // Simula uma busca na web
    return ok("Resultado da busca por: " + input);
  }
}
