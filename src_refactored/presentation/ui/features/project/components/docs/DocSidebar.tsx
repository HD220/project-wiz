import { FileText, Folder } from 'lucide-react';
import React from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';

import { DocEntry, mockDocsFileSystem } from './docs-data';

interface DocSidebarProps {
  selectedFilePath: string[];
  setSelectedFilePath: React.Dispatch<React.SetStateAction<string[]>>;
}

export function DocSidebar({
  selectedFilePath,
  setSelectedFilePath,
}: DocSidebarProps) {
  const renderFileTree = (
    tree: Record<string, DocEntry>,
    currentPath: string[] = [],
  ) => {
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
                  <Folder
                    size={14}
                    className="mr-2 flex-shrink-0 text-sky-500"
                  />
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
                  isSelected
                    ? 'bg-sky-100 dark:bg-sky-700/50 text-sky-700 dark:text-sky-300 font-medium'
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
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
      <div className="p-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Arquivos de Documentação
        </h3>
      </div>
      <ScrollArea className="h-full p-2">
        {renderFileTree(mockDocsFileSystem)}
      </ScrollArea>
    </aside>
  );
}
