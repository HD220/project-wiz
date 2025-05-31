import { Result } from "./result";

export interface Executable<I, O> {
  execute(data?: I): Promise<Result<O>>;
}
