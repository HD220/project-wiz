import { ScrollArea } from "@/components/ui/scroll-area";
import { DocTreeItem } from "./doc-tree-item";

interface DocFile {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  children?: DocFile[];
  content?: string;
}

interface DocTreeProps {
  docs: DocFile[];
  selectedDoc: DocFile | null;
  expandedFolders: Set<string>;
  onSelectDoc: (doc: DocFile) => void;
  onToggleFolder: (folderId: string) => void;
}

export function DocTree({
  docs,
  selectedDoc,
  expandedFolders,
  onSelectDoc,
  onToggleFolder,
}: DocTreeProps) {
  const renderDocTree = (items: DocFile[], level = 0): JSX.Element[] => {
    return items.map((doc) => (
      <div key={doc.id}>
        <DocTreeItem
          doc={doc}
          level={level}
          selectedDoc={selectedDoc}
          expandedFolders={expandedFolders}
          onSelect={onSelectDoc}
          onToggleFolder={onToggleFolder}
        />
        {doc.type === "folder" &&
          expandedFolders.has(doc.id) &&
          doc.children &&
          renderDocTree(doc.children, level + 1)}
      </div>
    ));
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-1">{renderDocTree(docs)}</div>
    </ScrollArea>
  );
}
