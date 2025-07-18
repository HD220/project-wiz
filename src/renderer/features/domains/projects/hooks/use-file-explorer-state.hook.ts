import { useMemo, useState } from "react";

import type { FileTreeItem } from "@/shared/types/projects/file-system.types";

import { useProjectFiles } from "./use-file-system.hook";

interface UseFileExplorerStateProps {
  projectId: string;
  onFileSelect?: (file: FileTreeItem) => void;
  onFileOpen?: (file: FileTreeItem) => void;
}

export function useFileExplorerState({
  projectId,
  onFileSelect,
  onFileOpen,
}: UseFileExplorerStateProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["root"]),
  );

  const { data: fileSystemData, isLoading, error } = useProjectFiles(projectId);

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
    if (file.type === "directory") {
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

  const filteredTree = useMemo(() => {
    if (!fileSystemData?.files) return [];

    return fileSystemData.files.filter((item) =>
      searchQuery
        ? item.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true,
    );
  }, [fileSystemData?.files, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    selectedPath,
    expandedFolders,
    filteredTree,
    handleFileClick,
    handleFileDoubleClick,
    isLoading,
    error,
  };
}
