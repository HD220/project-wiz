import { useState } from "react";

import { mockFileTree } from "@/renderer/lib/mock-data/files";
import type { FileTreeItem } from "@/renderer/lib/mock-data/types";

interface UseFileExplorerStateProps {
  onFileSelect?: (file: FileTreeItem) => void;
  onFileOpen?: (file: FileTreeItem) => void;
}

export function useFileExplorerState({
  onFileSelect,
  onFileOpen,
}: UseFileExplorerStateProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["root"]),
  );

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFileClick = (file: FileTreeItem) => {
    if (file.type === "folder") {
      toggleFolder(file.path);
    } else {
      setSelectedPath(file.path);
      onFileSelect?.(file);
    }
  };

  const handleFileDoubleClick = (file: FileTreeItem) => {
    if (file.type === "file") {
      onFileOpen?.(file);
    }
  };

  const filteredTree = mockFileTree.filter((item) =>
    searchQuery
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true,
  );

  return {
    searchQuery,
    setSearchQuery,
    selectedPath,
    expandedFolders,
    filteredTree,
    handleFileClick,
    handleFileDoubleClick,
  };
}
