import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';

export function ProjectNotFound() {
  return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-semibold mb-2">Projeto não encontrado</h2>
      <Button asChild variant="outline">
        <Link to="/projects">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Projetos
        </Link>
      </Button>
    </div>
  );
}
