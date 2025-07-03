import { Link } from '@tanstack/react-router';
import React from 'react';

import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';

interface ListItemFooterProps {
  templateId: string;
}

export function ListItemFooter({ templateId }: ListItemFooterProps) {
  return (
    <CardFooter className="p-3">
      <Button variant="outline" size="sm" className="w-full" asChild>
        <Link to="/personas/$templateId" params={{ templateId }}>
          Ver Detalhes / Editar
        </Link>
      </Button>
    </CardFooter>
  );
}
