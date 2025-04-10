import { ScrollArea } from "@/components/ui/scroll-area";
import type { DocFile } from "./use-documentation";
import { FileListItem } from "./file-list-item";

interface FileListProps {
  docs: DocFile[];
  selectedFile: string | null;
  onSelect: (path: string) => void;
}

export function FileList({ docs, selectedFile, onSelect }: FileListProps) {
  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="space-y-1">
        {docs.map((doc) => (
          <FileListItem
            key={doc.id}
            doc={doc}
            isSelected={selectedFile === doc.path}
            onSelect={onSelect}
          />
        ))}
      </div>
    </ScrollArea>
  );
}