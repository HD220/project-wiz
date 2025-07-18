import { useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export function NavigationSearch() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="mb-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar canais"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="pl-9 bg-background"
        />
      </div>
    </div>
  );
}
