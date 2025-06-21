import { Result } from "../../../shared/result";
import { CoreTool } from 'ai'; // Importar do SDK 'ai'

export interface ILLM {
  generate(prompt: string, tools?: CoreTool[]): Promise<Result<string>>;
}
