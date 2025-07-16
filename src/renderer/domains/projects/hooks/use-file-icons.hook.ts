import { File, FileText, Image, Code, Archive, Settings } from "lucide-react";
import type { FileTreeItem } from "../../../../lib/placeholders";

export function useFileIcons() {
  const getFileIcon = (file: FileTreeItem) => {
    if (file.type === "folder") {
      return null;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "txt":
      case "md":
      case "readme":
        return FileText;
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "svg":
        return Image;
      case "js":
      case "ts":
      case "tsx":
      case "jsx":
      case "css":
      case "html":
      case "json":
        return Code;
      case "zip":
      case "rar":
      case "tar":
      case "gz":
        return Archive;
      case "env":
      case "config":
        return Settings;
      default:
        return File;
    }
  };

  return { getFileIcon };
}
