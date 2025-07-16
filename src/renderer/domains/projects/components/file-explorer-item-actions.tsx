import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";

export function FileExplorerItemActions() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
    >
      <MoreHorizontal className="h-3 w-3" />
    </Button>
  );
}
