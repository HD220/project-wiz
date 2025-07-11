import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileExplorer } from "@/renderer/features/development-tools/components/file-explorer";
import { TerminalPanel } from "@/renderer/features/development-tools/components/terminal-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileTreeItem } from "@/lib/placeholders";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { PageTitle } from "@/components/page-title";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/files")({
  component: FilesComponent,
});

function FilesComponent() {
  const [selectedFile, setSelectedFile] = useState<FileTreeItem | null>(null);
  const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(false);

  const handleFileSelect = (file: FileTreeItem) => {
    setSelectedFile(file);
  };

  const handleFileOpen = (file: FileTreeItem) => {
    console.log("Opening file:", file.path);
  };

  return (
    <div className="h-full">
      <PageTitle title="Arquivos" icon={<FileText className="w-5 h-5 text-muted-foreground" />} />
      <ResizablePanelGroup direction="vertical" className="h-full">
        {/* Main Content Area */}
        <ResizablePanel defaultSize={75}>
          <ResizablePanelGroup direction="horizontal">
            {/* File Explorer */}
            <ResizablePanel defaultSize={25} minSize={20}>
              <FileExplorer
                onFileSelect={handleFileSelect}
                onFileOpen={handleFileOpen}
              />
            </ResizablePanel>

            <ResizableHandle />

            {/* File Content / Editor */}
            <ResizablePanel defaultSize={75}>
              <div className="h-full flex flex-col">
                {selectedFile ? (
                  <div className="flex-1 p-4">
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span>{selectedFile.name}</span>
                          {selectedFile.extension && (
                            <span className="text-sm text-muted-foreground">
                              {selectedFile.extension.toUpperCase()}
                            </span>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedFile.type === "file" ? (
                          <div className="space-y-4">
                            <div className="bg-muted p-4 rounded-lg">
                              <p className="text-sm text-muted-foreground mb-2">
                                Visualização do arquivo:
                              </p>
                              <pre className="text-sm">
                                {selectedFile.extension === "json"
                                  ? `{
  "name": "project-wiz",
  "version": "1.0.0",
  "description": "AI-powered project management tool",
  "dependencies": {
    "react": "^18.0.0",
    "typescript": "^5.0.0"
  }
}`
                                  : selectedFile.extension === "md"
                                    ? `# ${selectedFile.name}

Este é um arquivo de documentação do projeto.

## Recursos

- Sistema de chat com agentes IA
- Gerenciamento de tarefas Kanban
- Explorador de arquivos integrado
- Terminal embutido`
                                    : selectedFile.extension === "tsx"
                                      ? `import React from 'react';

export function ${selectedFile.name.replace(".tsx", "")}() {
  return (
    <div>
      <h1>Componente React</h1>
    </div>
  );
}`
                                      : "Conteúdo do arquivo será exibido aqui..."}
                              </pre>
                            </div>

                            {selectedFile.size && (
                              <div className="text-sm text-muted-foreground">
                                Tamanho: {(selectedFile.size / 1024).toFixed(1)}{" "}
                                KB
                              </div>
                            )}

                            {selectedFile.lastModified && (
                              <div className="text-sm text-muted-foreground">
                                Última modificação:{" "}
                                {selectedFile.lastModified.toLocaleString(
                                  "pt-BR",
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            Selecione um arquivo para visualizar seu conteúdo.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2">
                        Nenhum arquivo selecionado
                      </h3>
                      <p className="text-muted-foreground">
                        Selecione um arquivo no explorador para visualizá-lo
                        aqui.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle />

        {/* Terminal */}
        <ResizablePanel
          defaultSize={25}
          minSize={10}
          collapsible
          onCollapse={() => setIsTerminalCollapsed(true)}
          onExpand={() => setIsTerminalCollapsed(false)}
        >
          <TerminalPanel
            isCollapsed={isTerminalCollapsed}
            onToggleCollapse={() =>
              setIsTerminalCollapsed(!isTerminalCollapsed)
            }
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
