import { FileText, Folder, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocFile {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  children?: DocFile[];
  content?: string;
}

interface DocTreeItemProps {
  doc: DocFile;
  level: number;
  selectedDoc: DocFile | null;
  expandedFolders: Set<string>;
  onSelect: (doc: DocFile) => void;
  onToggleFolder: (folderId: string) => void;
}

export function DocTreeItem({
  doc,
  level,
  selectedDoc,
  expandedFolders,
  onSelect,
  onToggleFolder,
}: DocTreeItemProps) {
  const isExpanded = expandedFolders.has(doc.id);
  const isSelected = selectedDoc?.id === doc.id;

  const handleClick = () => {
    if (doc.type === "folder") {
      onToggleFolder(doc.id);
    } else {
      onSelect(doc);
    }
  };

  const renderIcon = () => {
    if (doc.type === "folder") {
      return isExpanded ? (
        <FolderOpen className="h-4 w-4 mr-2" />
      ) : (
        <Folder className="h-4 w-4 mr-2" />
      );
    }
    return <FileText className="h-4 w-4 mr-2" />;
  };

  return (
    <div className="select-none">
      <Button
        variant={isSelected ? "secondary" : "ghost"}
        className={`w-full justify-start px-2 py-1 h-auto text-sm font-normal ${
          level > 0 ? `ml-${level * 4}` : ""
        }`}
        onClick={handleClick}
      >
        {renderIcon()}
        <span className="truncate">{doc.name}</span>
      </Button>
    </div>
  );
}
