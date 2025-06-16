import { Result } from "../../shared/result";

export interface Executable<I, O> {
  execute(data?: I): Promise<Result<O>>;
}
