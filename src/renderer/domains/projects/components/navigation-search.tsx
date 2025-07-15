import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

interface NavigationSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function NavigationSearch({
  searchQuery,
  onSearchChange,
}: NavigationSearchProps) {
  return (
    <div className="p-3 border-b border-border flex-none">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar canais"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-background"
        />
      </div>
    </div>
  );
}
