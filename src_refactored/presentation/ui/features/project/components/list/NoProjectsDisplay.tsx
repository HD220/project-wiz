import { Link } from "@tanstack/react-router";
import { PlusCircle } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";

interface NoProjectsDisplayProps {
  searchTerm: string;
}

export function NoProjectsDisplay({ searchTerm }: NoProjectsDisplayProps) {
  return (
    <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg mt-6">
      <svg
        className="mx-auto h-12 w-12 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a15.997 15.997 0 00-4.764 4.648l-3.876 5.814a1.151 1.151 0 001.597 1.597l5.814-3.875a15.996 15.996 0 004.649-4.763m-3.42-3.42a15.995 15.995 0 00a4.5 4.5 0 00-8.4-2.245c0-.399.078-.78.22-1.128"
        />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-50">
        {searchTerm ? "Nenhum projeto encontrado" : "Nenhum projeto criado"}
      </h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {searchTerm
          ? "Tente ajustar seus filtros ou termos de busca."
          : "Comece criando seu primeiro projeto."}
      </p>
      {!searchTerm && (
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link to="/projects/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar Novo Projeto
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
