import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import type { FileTreeItem } from "@/shared/types/projects/file-system.types";

import { useFileExplorerState } from "../hooks/use-file-explorer-state.hook";

import { FileExplorerHeader } from "./file-explorer-header";
import { FileExplorerItem } from "./file-explorer-item";

interface FileExplorerProps {
  projectId: string;
  className?: string;
  onFileSelect?: (file: FileTreeItem) => void;
  onFileOpen?: (file: FileTreeItem) => void;
}

export function FileExplorer({
  projectId,
  className,
  onFileSelect,
  onFileOpen,
}: FileExplorerProps) {
  const state = useFileExplorerState({ projectId, onFileSelect, onFileOpen });

  if (state.isLoading) {
    return (
      <div className={cn("bg-background border rounded-lg", className)}>
        <FileExplorerHeader
          searchQuery={state.searchQuery}
          setSearchQuery={state.setSearchQuery}
        />
        <div className="p-4 text-center text-sm text-muted-foreground">
          Loading files...
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={cn("bg-background border rounded-lg", className)}>
        <FileExplorerHeader
          searchQuery={state.searchQuery}
          setSearchQuery={state.setSearchQuery}
        />
        <div className="p-4 text-center text-sm text-destructive">
          Error loading files: {state.error.message}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-background border rounded-lg", className)}>
      <FileExplorerHeader
        searchQuery={state.searchQuery}
        setSearchQuery={state.setSearchQuery}
      />

      <ScrollArea className="h-[300px]">
        <div className="p-2 space-y-0.5">
          {state.filteredTree.map((item) => (
            <FileExplorerItem
              key={item.path}
              item={item}
              level={item.path.split("/").length - 1}
              isExpanded={state.expandedFolders.has(item.path)}
              isSelected={state.selectedPath === item.path}
              onClick={() => state.handleFileClick(item)}
              onDoubleClick={() => state.handleFileDoubleClick(item)}
            />
          ))}
          {state.filteredTree.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No files found
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
