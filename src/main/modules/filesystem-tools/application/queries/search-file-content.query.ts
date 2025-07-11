import { IQuery } from "@/main/kernel/cqrs-dispatcher";
import { ApplicationError } from "@/main/errors/application.error";
import { FilesystemService } from "@/main/modules/filesystem-tools/domain/filesystem.service";

export class SearchFileContentQuery
  implements
    IQuery<{
      relativePath: string;
      pattern: string;
    }>
{
  readonly type = "SearchFileContentQuery";

  constructor(
    public readonly relativePath: string,
    public readonly pattern: string,
  ) {}

  get payload() {
    return { relativePath: this.relativePath, pattern: this.pattern };
  }
}

export class SearchFileContentQueryHandler {
  constructor(private filesystemService: FilesystemService) {}

  async handle(query: SearchFileContentQuery): Promise<string[]> {
    try {
      return await this.filesystemService.searchFileContent(
        query.relativePath,
        query.pattern,
      );
    } catch (error: unknown) {
      console.error(`Failed to search file content:`, error);
      throw new ApplicationError(
        `Failed to search file content: ${(error as Error).message}`,
      );
    }
  }
}
