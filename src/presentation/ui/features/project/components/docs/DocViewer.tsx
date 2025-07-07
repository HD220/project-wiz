import { Edit, FileText } from 'lucide-react';
import React from 'react';

import { MarkdownRenderer } from '@/components/common/markdown-renderer';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface DocViewerProps {
  selectedFilePath: string[];
  currentFileContent: string | null;
}

export function DocViewer({ selectedFilePath, currentFileContent }: DocViewerProps) {
  return (
    <main className="flex-1 p-4 md:p-6 overflow-y-auto">
      {currentFileContent ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{selectedFilePath.join(' / ')}</CardTitle>
              <CardDescription>Visualizando documento.</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Edit size={14} className="mr-1.5" /> Editar (N/I)
            </Button>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <MarkdownRenderer content={currentFileContent} />
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-10">
          <FileText size={48} className="mx-auto text-slate-400 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">
            {selectedFilePath.length > 0
              ? 'Arquivo não encontrado ou é um diretório.'
              : 'Selecione um arquivo para visualizar.'}
          </p>
        </div>
      )}
    </main>
  );
}
