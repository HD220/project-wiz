import { IQuery } from "@/main/kernel/cqrs-dispatcher";
import { FilesystemService } from "@/main/modules/filesystem-tools/filesystem.service";

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
      throw new Error(
        `Failed to search file content: ${(error as Error).message}`,
      );
    }
  }
}
