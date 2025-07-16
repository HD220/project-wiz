import {
  ChevronRight,
  ChevronDown,
  Folder,
  Copy,
  Trash2,
  Edit,
  Download,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../../../../components/ui/context-menu";
import { Badge } from "../../../../components/ui/badge";
import { cn } from "../../../../lib/utils";
import { useFileIcons } from "../hooks/use-file-icons.hook";
import type { FileTreeItem } from "../../../../lib/placeholders";

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
  const { getFileIcon } = useFileIcons();
  const FileIcon = getFileIcon(item);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1 text-sm rounded cursor-pointer hover:bg-accent hover:text-accent-foreground group",
            isSelected && "bg-accent text-accent-foreground",
          )}
          style={{ paddingLeft: `${8 + level * 16}px` }}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
        >
          {item.type === "folder" && (
            <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}

          {item.type === "folder" ? (
            <Folder className="h-4 w-4 text-blue-500" />
          ) : (
            FileIcon && <FileIcon className="h-4 w-4 text-muted-foreground" />
          )}

          <span className="flex-1 truncate">{item.name}</span>

          {item.isModified && (
            <Badge variant="secondary" className="h-4 text-xs">
              M
            </Badge>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem>
          <Copy className="h-4 w-4 mr-2" />
          Copiar
        </ContextMenuItem>
        <ContextMenuItem>
          <Edit className="h-4 w-4 mr-2" />
          Renomear
        </ContextMenuItem>
        <ContextMenuItem>
          <Download className="h-4 w-4 mr-2" />
          Download
        </ContextMenuItem>
        <ContextMenuItem className="text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
