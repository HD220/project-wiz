import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { PageTitle } from "@/components/page-title";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { DocTree } from "@/domains/projects/components/docs/doc-tree";
import { DocViewer } from "@/domains/projects/components/docs/doc-viewer";
import {
  mockDocs,
  type DocFile,
} from "@/domains/projects/components/docs/mock-docs-data";

export const Route = createFileRoute("/project/$projectId/docs/")({
  component: ProjectDocsPage,
});

export function ProjectDocsPage() {
  const [selectedDoc, setSelectedDoc] = useState<DocFile | null>(mockDocs[0]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["2", "4", "6"]),
  );

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  return (
    <div className="flex flex-col h-full">
      <PageTitle title="Documentação" />

      <div className="flex-1 p-6">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="h-full border rounded-lg bg-background">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Documentos</h3>
              </div>
              <DocTree
                docs={mockDocs}
                selectedDoc={selectedDoc}
                expandedFolders={expandedFolders}
                onSelectDoc={setSelectedDoc}
                onToggleFolder={toggleFolder}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={70}>
            <div className="h-full border rounded-lg bg-background">
              <DocViewer selectedDoc={selectedDoc} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
