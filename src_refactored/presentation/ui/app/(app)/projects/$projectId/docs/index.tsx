import { createFileRoute } from '@tanstack/react-router';
import { Folder, FileText, Edit } from 'lucide-react';
import React from 'react';

import { MarkdownRenderer } from '@/presentation/ui/components/common/MarkdownRenderer';
import { Button } from '@/presentation/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
import { ScrollArea } from '@/presentation/ui/components/ui/scroll-area';
import { Separator } from '@/presentation/ui/components/ui/separator';


// Mock documentation structure and content
const mockDocsFileSystem = {
  readmeMd: {
    type: 'file',
    content: `# Documentação do Projeto X

Bem-vindo à documentação oficial do Projeto X. Este documento serve como ponto de partida para entender a arquitetura, configuração e funcionalidades chave.

## Seções Principais
- Arquitetura do Sistema
- Guia de Instalação
- Casos de Uso

### Exemplo de Código
\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`
`,
  },
  arquiteturaDir: {
    type: 'folder',
    nameOverride: 'arquitetura/',
    children: {
      visaoGeralMd: {
        nameOverride: 'visao-geral.md',
        type: 'file',
        content: '## Visão Geral da Arquitetura\n\nO sistema é modular...'
      },
      componentesMd: {
        nameOverride: 'componentes.md',
        type: 'file',
        content: '### Componentes Principais\n\n- Módulo A\n- Módulo B'
      }
    }
  },
  guiasDir: {
    type: 'folder',
    nameOverride: 'guias/',
    children: {
      instalacaoMd: {
        nameOverride: 'instalacao.md',
        type: 'file',
        content: '## Guia de Instalação\n\nSiga os passos...'
      }
    }
  }
};

type DocFile = { type: 'file'; content: string; nameOverride?: string; };
type DocFolder = { type: 'folder'; children: Record<string, DocEntry>; nameOverride?: string;};
type DocEntry = DocFile | DocFolder;


function ProjectDocsPage() {
  // const params = useParams({ from: '/(app)/projects/$projectId/docs' }); // params not used, commented out
  // const projectId = params.projectId;
  const [selectedFilePath, setSelectedFilePath] = React.useState<string[]>(['readmeMd']);

  const getFileContent = (pathSegments: string[]): string | null => {
    let currentEntry: DocEntry | Record<string, DocEntry> | undefined = mockDocsFileSystem;
    for (const segment of pathSegments) {
        if (!currentEntry) return null;

        if (typeof currentEntry === 'object' && 'children' in currentEntry && currentEntry.children) {
            currentEntry = currentEntry.children[segment];
        } else if (typeof currentEntry === 'object' && !( 'type' in currentEntry) && segment in currentEntry) {
            currentEntry = (currentEntry as Record<string, DocEntry>)[segment];
        } else {
            return null;
        }
    }
    return (currentEntry && typeof currentEntry === 'object' && 'type' in currentEntry && currentEntry.type === 'file') ? currentEntry.content : null;
};

  const currentFileContent = getFileContent(selectedFilePath);

  const renderFileTree = (tree: Record<string, DocEntry>, currentPath: string[] = []) => {
    return (
      <ul className="space-y-1 pl-3">
        {Object.entries(tree).map(([key, entry]) => {
          const displayName = entry.nameOverride || key;
          const newPath = [...currentPath, key];
          const isSelected = newPath.join('/') === selectedFilePath.join('/');
          if (entry.type === 'folder') {
            return (
              <li key={key}>
                <div className="flex items-center text-sm text-slate-700 dark:text-slate-300 py-1">
                  <Folder size={14} className="mr-2 flex-shrink-0 text-sky-500" />
                  {displayName.replace('/', '')}
                </div>
                {renderFileTree(entry.children, newPath)}
              </li>
            );
          }
          return (
            <li key={key}>
              <button
                onClick={() => setSelectedFilePath(newPath)}
                className={`flex items-center w-full text-left text-sm py-1 px-2 rounded ${
                  isSelected ? 'bg-sky-100 dark:bg-sky-700/50 text-sky-700 dark:text-sky-300 font-medium'
                             : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <FileText size={14} className="mr-2 flex-shrink-0" />
                {displayName}
              </button>
            </li>
          );
        })}
      </ul>
    );
  };


  return (
    <div className="flex h-[calc(100vh-var(--header-height,150px))]">
      <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
        <div className="p-3 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Arquivos de Documentação</h3>
        </div>
        <ScrollArea className="h-full p-2">
          {renderFileTree(mockDocsFileSystem)}
        </ScrollArea>
      </aside>

      {/* Área de Conteúdo do Documento */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        {currentFileContent ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{selectedFilePath.join(' / ')}</CardTitle>
                <CardDescription>Visualizando documento.</CardDescription>
              </div>
              <Button variant="outline" size="sm"><Edit size={14} className="mr-1.5"/> Editar (N/I)</Button>
            </CardHeader>
            <Separator/>
            {/* Use the new MarkdownRenderer component */}
            {/* The prose classes are now handled by MarkdownRenderer by default,
                but can be overridden with proseClassName if needed.
                The CardContent can provide padding if MarkdownRenderer itself doesn't. */}
            <CardContent className="pt-6">
              <MarkdownRenderer content={currentFileContent} />
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-10">
            <FileText size={48} className="mx-auto text-slate-400 mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              {selectedFilePath.length > 0 ? "Arquivo não encontrado ou é um diretório." : "Selecione um arquivo para visualizar."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export const Route = createFileRoute('/(app)/projects/$projectId/docs/')({
  component: ProjectDocsPage,
});
