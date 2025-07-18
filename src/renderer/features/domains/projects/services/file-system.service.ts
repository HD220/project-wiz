import type {
  FileSystemDto,
  FileContentDto,
} from "@/shared/types/domains/projects/file-system.types";

export const fileSystemService = {
  async getProjectFiles(projectId: string): Promise<FileSystemDto> {
    return window.api.fileSystem.getProjectFiles(projectId);
  },

  async getFileContent(filePath: string): Promise<FileContentDto> {
    return window.api.fileSystem.getFileContent(filePath);
  },
};
