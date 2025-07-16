import { Badge } from '@/components/ui/badge'

import type { FileTreeItem } from "../../../../lib/placeholders";

interface FileExplorerItemContentProps {
  item: FileTreeItem;
}

export function FileExplorerItemContent({
  item,
}: FileExplorerItemContentProps) {
  return (
    <>
      <span className="flex-1 truncate">{item.name}</span>

      {item.isModified && (
        <Badge variant="secondary" className="h-4 text-xs">
          M
        </Badge>
      )}
    </>
  );
}
