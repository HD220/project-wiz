import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';

export function TemplateNotFound() {
  return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-semibold mb-2">
        Template de Persona não encontrado
      </h2>
      <Button asChild variant="outline" className="mt-4">
        <Link to="/app/personas">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista de Personas
        </Link>
      </Button>
    </div>
  );
}
