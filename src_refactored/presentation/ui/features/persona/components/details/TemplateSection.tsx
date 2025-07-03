import React from 'react';

import { Separator } from '@/components/ui/separator';

interface TemplateSectionProps {
  title: string;
  content?: string | null;
  children?: React.ReactNode;
}

export function TemplateSection({ title, content, children }: TemplateSectionProps) {
  if (!content && !children) return null;

  return (
    <>
      <Separator />
      <div>
        <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          {title}
        </h3>
        {content && (
          <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
            {content}
          </p>
        )}
        {children}
      </div>
    </>
  );
}
