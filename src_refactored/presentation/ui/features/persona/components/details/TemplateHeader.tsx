import { UserSquare } from 'lucide-react';
import React from 'react';

import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface TemplateHeaderProps {
  name: string;
  role: string;
}

export function TemplateHeader({ name, role }: TemplateHeaderProps) {
  return (
    <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-6">
      <div className="flex items-start gap-4">
        <UserSquare className="h-12 w-12 text-sky-500 dark:text-sky-400 flex-shrink-0 mt-1" />
        <div>
          <CardTitle className="text-2xl lg:text-3xl">{name}</CardTitle>
          <CardDescription className="text-sm lg:text-base mt-1">
            Papel: {role}
          </CardDescription>
        </div>
      </div>
    </CardHeader>
  );
}
