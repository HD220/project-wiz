import { Link } from "@tanstack/react-router";
import { PlusCircle } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";

export function ProjectsHeader() {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Seus Projetos
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Visualize, gerencie e crie novos projetos de software.
        </p>
      </div>
      <Button asChild>
        <Link to="/projects/new">
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Projeto
        </Link>
      </Button>
    </header>
  );
}
