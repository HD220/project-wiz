"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "@/hooks/use-search-params";

export function SearcInput() {
  const [searchTerm, handleSearch] = useSearchParams("q", "");

  return (
    <span className="relative flex items-center">
      <Input
        type="text"
        placeholder="Pesquisar repositórios..."
        defaultValue={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="h-8 px-2"
      />
      <Search className="absolute w-4 h-4 right-2" />
    </span>
  );
}
