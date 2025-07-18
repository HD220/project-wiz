import type { FileTreeItem } from "@/renderer/lib/mock-data/types";

import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";

import { FileExplorerItemActions } from "./file-explorer-item-actions";
import { FileExplorerItemContent } from "./file-explorer-item-content";
import { FileExplorerItemContextMenu } from "./file-explorer-item-context-menu";
import { FileExplorerItemIcon } from "./file-explorer-item-icon";

interface FileExplorerItemProps {
  item: FileTreeItem;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}

export function FileExplorerItem({
  item,
  level,
  isExpanded,
  isSelected,
  onClick,
  onDoubleClick,
}: FileExplorerItemProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1 px-2 py-1 text-sm rounded cursor-pointer hover:bg-accent hover:text-accent-foreground group w-full text-left",
            isSelected && "bg-accent text-accent-foreground",
          )}
          style={{ paddingLeft: `${8 + level * 16}px` }}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              onClick();
            }
          }}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              onDoubleClick();
            }
          }}
        >
          <FileExplorerItemIcon item={item} isExpanded={isExpanded} />
          <FileExplorerItemContent item={item} />
          <FileExplorerItemActions />
        </button>
      </ContextMenuTrigger>
      <FileExplorerItemContextMenu />
    </ContextMenu>
  );
}
