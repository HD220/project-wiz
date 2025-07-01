import { Result } from "../../../shared/result";

export interface IVersionControlSystem {
  init(path: string): Promise<Result<void>>;
  changeWorkingDirectory(path: string): Promise<Result<void>>;
}

export const IVersionControlSystemToken = Symbol.for("IVersionControlSystem");
