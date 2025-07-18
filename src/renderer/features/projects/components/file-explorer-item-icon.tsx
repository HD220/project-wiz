import { ChevronRight, ChevronDown, Folder } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useFileIcons } from "../hooks/use-file-icons.hook";

import type { FileTreeItem } from "@/lib/mock-data/types";

interface FileExplorerItemIconProps {
  item: FileTreeItem;
  isExpanded: boolean;
}

export function FileExplorerItemIcon({
  item,
  isExpanded,
}: FileExplorerItemIconProps) {
  const { getFileIcon } = useFileIcons();
  const FileIcon = getFileIcon(item);

  return (
    <>
      {item.type === "directory" && (
        <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </Button>
      )}

      {item.type === "directory" ? (
        <Folder className="h-4 w-4 text-blue-500" />
      ) : (
        FileIcon && <FileIcon className="h-4 w-4 text-muted-foreground" />
      )}
    </>
  );
}
