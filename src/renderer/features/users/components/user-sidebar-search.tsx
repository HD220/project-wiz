import { Search } from "lucide-react";

import { Input } from "@/ui/input";

interface UserSidebarSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function UserSidebarSearch({
  searchQuery,
  setSearchQuery,
}: UserSidebarSearchProps) {
  return (
    <div className="p-3 border-b border-border flex-none">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar conversas"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-background"
        />
      </div>
    </div>
  );
}
