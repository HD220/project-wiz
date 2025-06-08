import { Result } from "@/core/common/result";

export interface Executable<I, O> {
  execute(data?: I): Promise<Result<O>>;
}
