"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export function SearcInput() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <span className="relative flex items-center">
      <Input
        type="text"
        placeholder="Pesquisar repositórios..."
        value={searchTerm}
        onChange={handleSearch}
        className="border border-gray-300 rounded-md p-2"
      />
      <Search className="absolute w-4 h-4 right-2" />
    </span>
  );
}
