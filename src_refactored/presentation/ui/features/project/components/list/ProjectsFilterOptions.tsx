import { LayoutGrid, List } from "lucide-react";
import React from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ProjectsFilterOptionsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
}

export function ProjectsFilterOptions({
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  viewMode,
  setViewMode,
}: ProjectsFilterOptionsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
      <Input
        placeholder="Buscar projetos..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        className="flex-grow sm:flex-grow-0 sm:w-auto md:min-w-[250px]"
      />
      <Select value={sortOrder} onValueChange={setSortOrder}>
        <SelectTrigger className="w-full sm:w-auto">
          <SelectValue placeholder="Ordenar por..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
          <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
          <SelectItem value="activity-desc" disabled>
            Última Atividade (Recente)
          </SelectItem>
          <SelectItem value="activity-asc" disabled>
            Última Atividade (Antiga)
          </SelectItem>
        </SelectContent>
      </Select>
      <ToggleGroup
        type="single"
        value={viewMode}
        onValueChange={(value) =>
          value && setViewMode(value as "grid" | "list")
        }
        className="ml-auto"
      >
        <ToggleGroupItem value="grid" aria-label="Visualização em Grade">
          <LayoutGrid className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="Visualização em Lista">
          <List className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
