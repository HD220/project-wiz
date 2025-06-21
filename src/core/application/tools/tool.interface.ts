import { Result } from "../../../shared/result";

export interface ITool {
  name: string;
  description: string;
  execute(input: string): Promise<Result<string>>;
}
