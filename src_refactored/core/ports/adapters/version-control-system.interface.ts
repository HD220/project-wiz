

export interface IVersionControlSystem {
  init(path: string): Promise<void>;
  changeWorkingDirectory(path: string): Promise<void>;
}

export const IVersionControlSystemToken = Symbol.for("IVersionControlSystem");
