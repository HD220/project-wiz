import { Button } from "@/components/ui/button";
import type { DocFile } from "./use-documentation";

interface FileListItemProps {
  doc: DocFile;
  isSelected: boolean;
  onSelect: (path: string) => void;
}

export function FileListItem({ doc, isSelected, onSelect }: FileListItemProps) {
  return (
    <Button
      key={doc.id}
      variant={isSelected ? "secondary" : "ghost"}
      className="w-full justify-start text-left"
      onClick={() => onSelect(doc.path)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-2"
      >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
      <div>
        <div className="font-medium">{doc.name}</div>
        <div className="text-xs text-muted-foreground">{doc.path}</div>
      </div>
    </Button>
  );
}