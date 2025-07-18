import { promises as fs } from "fs";
import path from "path";

import { generateId } from "@/main/utils/id-generator";
import { getLogger } from "@/main/utils/logger";

import type {
  FileContentDto,
  FileSystemDto,
  FileTreeItem,
} from "@/shared/types/projects/file-system.types";

const logger = getLogger("file-system-service");

class FileSystemService {
  private async isDirectory(filePath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(filePath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  private async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async buildFileTree(
    basePath: string,
    relativePath: string = "",
    parentId?: string,
  ): Promise<FileTreeItem[]> {
    const fullPath = path.join(basePath, relativePath);
    const items: FileTreeItem[] = [];

    try {
      const dirContents = await fs.readdir(fullPath);

      for (const item of dirContents) {
        const itemPath = path.join(fullPath, item);
        const itemRelativePath = path.join(relativePath, item);
        const isDir = await this.isDirectory(itemPath);

        // Skip hidden files and common unimportant directories
        if (
          item.startsWith(".") ||
          ["node_modules", ".git", "dist", "build"].includes(item)
        ) {
          continue;
        }

        const stats = await fs.stat(itemPath);
        const fileItem: FileTreeItem = {
          id: generateId("file"),
          name: item,
          type: isDir ? "directory" : "file",
          ...(parentId && { parentId }),
          path: itemRelativePath,
          size: isDir ? undefined : stats.size,
          modified: stats.mtime,
          extension: isDir ? undefined : path.extname(item).slice(1),
        };

        if (isDir) {
          // Recursively build subdirectories (limit depth to avoid performance issues)
          const depth = itemRelativePath.split(path.sep).length;
          if (depth < 5) {
            fileItem.children = await this.buildFileTree(
              basePath,
              itemRelativePath,
              fileItem.id,
            );
          }
        }

        items.push(fileItem);
      }
    } catch (error) {
      logger.error(`Error reading directory ${fullPath}:`, error);
    }

    return items;
  }

  async getProjectFileSystem(projectId: string): Promise<FileSystemDto> {
    try {
      // For now, we'll use a mock project directory
      // In a real implementation, this would fetch the project's actual directory path
      const projectPath = path.join(process.cwd(), "sample-project");

      // If the sample directory doesn't exist, create a basic structure
      if (!(await this.exists(projectPath))) {
        await this.createSampleProjectStructure(projectPath);
      }

      const files = await this.buildFileTree(projectPath);

      return {
        projectId,
        rootPath: projectPath,
        files,
      };
    } catch (error) {
      logger.error(
        `Error getting file system for project ${projectId}:`,
        error,
      );
      throw error;
    }
  }

  async getFileContent(filePath: string): Promise<FileContentDto> {
    try {
      const fullPath = path.resolve(filePath);
      const stats = await fs.stat(fullPath);
      const content = await fs.readFile(fullPath, "utf-8");

      return {
        path: filePath,
        content,
        mimeType: this.getMimeType(path.extname(filePath)),
        size: stats.size,
        modified: stats.mtime,
      };
    } catch (error) {
      logger.error(`Error reading file ${filePath}:`, error);
      throw error;
    }
  }

  private getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      ".txt": "text/plain",
      ".js": "application/javascript",
      ".ts": "application/typescript",
      ".jsx": "text/jsx",
      ".tsx": "text/tsx",
      ".json": "application/json",
      ".md": "text/markdown",
      ".html": "text/html",
      ".css": "text/css",
      ".scss": "text/scss",
      ".less": "text/less",
      ".xml": "application/xml",
      ".yaml": "application/yaml",
      ".yml": "application/yaml",
    };

    return mimeTypes[extension] || "text/plain";
  }

  private async createSampleProjectStructure(
    projectPath: string,
  ): Promise<void> {
    try {
      await fs.mkdir(projectPath, { recursive: true });

      // Create sample directories
      await fs.mkdir(path.join(projectPath, "src"), { recursive: true });
      await fs.mkdir(path.join(projectPath, "src", "components"), {
        recursive: true,
      });
      await fs.mkdir(path.join(projectPath, "src", "utils"), {
        recursive: true,
      });
      await fs.mkdir(path.join(projectPath, "docs"), { recursive: true });
      await fs.mkdir(path.join(projectPath, "tests"), { recursive: true });

      // Create sample files
      await fs.writeFile(
        path.join(projectPath, "README.md"),
        "# Sample Project\n\nThis is a sample project structure.",
      );
      await fs.writeFile(
        path.join(projectPath, "package.json"),
        JSON.stringify(
          {
            name: "sample-project",
            version: "1.0.0",
            description: "A sample project",
            main: "index.js",
            scripts: {
              start: "node index.js",
              test: "jest",
            },
          },
          null,
          2,
        ),
      );
      await fs.writeFile(
        path.join(projectPath, "src", "index.js"),
        "console.log('Hello, World!');\n",
      );
      await fs.writeFile(
        path.join(projectPath, "src", "components", "Button.jsx"),
        `import React from 'react';

export function Button({ children, onClick }) {
  return (
    <button onClick={onClick}>
      {children}
    </button>
  );
}
`,
      );
      await fs.writeFile(
        path.join(projectPath, "src", "utils", "helpers.js"),
        `export function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
`,
      );
      await fs.writeFile(
        path.join(projectPath, "docs", "API.md"),
        "# API Documentation\n\nAPI documentation goes here.",
      );
      await fs.writeFile(
        path.join(projectPath, "tests", "index.test.js"),
        "// Test files go here",
      );

      logger.info(`Sample project structure created at ${projectPath}`);
    } catch (error) {
      logger.error(`Error creating sample project structure:`, error);
      throw error;
    }
  }
}

export const fileSystemService = new FileSystemService();
