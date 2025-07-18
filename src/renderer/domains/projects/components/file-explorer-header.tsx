import { Search, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FileExplorerHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function FileExplorerHeader({
  searchQuery,
  setSearchQuery,
}: FileExplorerHeaderProps) {
  return (
    <div className="p-3 border-b space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Explorador de Arquivos</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          placeholder="Buscar arquivos..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="pl-7 h-7 text-xs"
        />
      </div>
    </div>
  );
}
