// src/core/ports/adapters/file-system.interface.ts
import { IUseCaseResponse } from "../../../shared/application/use-case-response.types";

export interface IFileSystem {
  mkdir(
    path: string,
    options?: { recursive?: boolean }
  ): Promise<IUseCaseResponse<void>>;
  writeFile(path: string, content: string): Promise<IUseCaseResponse<void>>;
  readFile(path: string): Promise<IUseCaseResponse<string>>;
  exists(path: string): Promise<IUseCaseResponse<boolean>>;
  // Add other methods as needed: rmdir, unlink, readdir, etc.
}

export const IFileSystemToken = Symbol.for("IFileSystem");
