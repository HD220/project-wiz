import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocFile {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  children?: DocFile[];
  content?: string;
}

interface DocViewerProps {
  selectedDoc: DocFile | null;
}

export function DocViewer({ selectedDoc }: DocViewerProps) {
  if (!selectedDoc) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-lg font-medium">Selecione um documento</p>
          <p className="text-sm">
            Escolha um arquivo na árvore para visualizar seu conteúdo
          </p>
        </div>
      </div>
    );
  }

  if (selectedDoc.type === "folder") {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-4">📁</div>
          <p className="text-lg font-medium">Pasta selecionada</p>
          <p className="text-sm">
            Selecione um arquivo para visualizar seu conteúdo
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{selectedDoc.name}</h1>
          <p className="text-sm text-muted-foreground">{selectedDoc.path}</p>
        </div>

        {selectedDoc.content && (
          <MarkdownRenderer content={selectedDoc.content} />
        )}
      </div>
    </ScrollArea>
  );
}
