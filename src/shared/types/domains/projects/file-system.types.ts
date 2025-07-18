export interface FileTreeItem {
  id: string;
  name: string;
  type: "file" | "directory";
  parentId?: string;
  path: string;
  size?: number;
  modified?: Date;
  extension?: string;
  children?: FileTreeItem[];
}

export interface FileSystemDto {
  projectId: string;
  rootPath: string;
  files: FileTreeItem[];
}

export interface FileContentDto {
  path: string;
  content: string;
  mimeType: string;
  size: number;
  modified: Date;
}

export interface FileSystemOperationDto {
  operation: "create" | "update" | "delete" | "move" | "copy";
  path: string;
  newPath?: string;
  content?: string;
  isDirectory?: boolean;
}
