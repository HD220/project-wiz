import { IQuery } from "@/main/kernel/cqrs-dispatcher";
import { ApplicationError } from "@/main/errors/application.error";
import { FilesystemService } from "@/main/modules/filesystem-tools/domain/filesystem.service";

export class ReadFileQuery
  implements
    IQuery<{
      relativePath: string;
    }>
{
  readonly type = "ReadFileQuery";

  constructor(public readonly relativePath: string) {}

  get payload() {
    return { relativePath: this.relativePath };
  }
}

export class ReadFileQueryHandler {
  constructor(private filesystemService: FilesystemService) {}

  async handle(query: ReadFileQuery): Promise<string> {
    try {
      return await this.filesystemService.readFile(query.relativePath);
    } catch (error: unknown) {
      console.error(`Failed to read file:`, error);
      throw new ApplicationError(`Failed to read file: ${(error as Error).message}`);
    }
  }
}
