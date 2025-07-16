import { Copy, Trash2, Edit, Download } from "lucide-react";
import {
  ContextMenuContent,
  ContextMenuItem,
} from "../../../../components/ui/context-menu";

export function FileExplorerItemContextMenu() {
  return (
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
  );
}