import { Result } from "../../../shared/result";

export interface ILLM {
  generate(prompt: string): Promise<Result<string>>;
}
