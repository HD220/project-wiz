import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  File,
  Search,
  Plus,
  MoreHorizontal,
  Copy,
  Trash2,
  Edit,
  Download,
  FileText,
  Image,
  Code,
  Settings,
  Archive,
} from "lucide-react";
import { FileTreeItem, mockFileTree } from "@/lib/placeholders";
import { cn } from "@/lib/utils";

interface FileExplorerProps {
  projectId?: string;
  className?: string;
  onFileSelect?: (file: FileTreeItem) => void;
  onFileOpen?: (file: FileTreeItem) => void;
}

export function FileExplorer({ 
  projectId, 
  className, 
  onFileSelect, 
  onFileOpen 
}: FileExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const getFileIcon = (item: FileTreeItem) => {
    if (item.type === 'folder') {
      return <Folder className="w-4 h-4 text-blue-500" />;
    }

    const extension = item.extension?.toLowerCase();
    switch (extension) {
      case 'tsx':
      case 'ts':
      case 'jsx':
      case 'js':
        return <Code className="w-4 h-4 text-yellow-500" />;
      case 'json':
        return <Settings className="w-4 h-4 text-green-500" />;
      case 'md':
      case 'txt':
        return <FileText className="w-4 h-4 text-gray-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <Image className="w-4 h-4 text-purple-500" />;
      case 'zip':
      case 'tar':
      case 'gz':
        return <Archive className="w-4 h-4 text-orange-500" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleItemClick = (item: FileTreeItem) => {
    setSelectedPath(item.path);
    onFileSelect?.(item);

    if (item.type === 'file') {
      onFileOpen?.(item);
    }
  };

  const handleContextAction = (action: string, item: FileTreeItem) => {
    console.log(`${action} action for:`, item.path);
    // TODO: Implement context actions
  };

  return (
    <div className={cn("h-full flex flex-col bg-card border-r border-border", className)}>
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Explorador</h3>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="w-6 h-6">
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-6 h-6">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Buscar arquivos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 h-8 text-sm"
          />
        </div>
      </div>

      {/* File Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {mockFileTree.map((item) => (
            <FileTreeNode
              key={item.path}
              item={item}
              level={0}
              searchQuery={searchQuery}
              selectedPath={selectedPath}
              onItemClick={handleItemClick}
              onContextAction={handleContextAction}
              getFileIcon={getFileIcon}
            />
          ))}
        </div>
      </ScrollArea>

      {/* File Details */}
      {selectedPath && (
        <div className="p-3 border-t border-border bg-muted/30">
          {(() => {
            const findItem = (items: FileTreeItem[], path: string): FileTreeItem | null => {
              for (const item of items) {
                if (item.path === path) return item;
                if (item.children) {
                  const found = findItem(item.children, path);
                  if (found) return found;
                }
              }
              return null;
            };
            
            const selectedItem = findItem(mockFileTree, selectedPath);
            if (!selectedItem) return null;

            return (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getFileIcon(selectedItem)}
                  <span className="text-sm font-medium truncate">{selectedItem.name}</span>
                </div>
                
                {selectedItem.type === 'file' && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    {selectedItem.size && (
                      <div>Tamanho: {formatFileSize(selectedItem.size)}</div>
                    )}
                    {selectedItem.lastModified && (
                      <div>Modificado: {formatDate(selectedItem.lastModified)}</div>
                    )}
                    {selectedItem.extension && (
                      <div>Tipo: {selectedItem.extension.toUpperCase()}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

interface FileTreeNodeProps {
  item: FileTreeItem;
  level: number;
  searchQuery: string;
  selectedPath: string | null;
  onItemClick: (item: FileTreeItem) => void;
  onContextAction: (action: string, item: FileTreeItem) => void;
  getFileIcon: (item: FileTreeItem) => React.ReactNode;
}

function FileTreeNode({
  item,
  level,
  searchQuery,
  selectedPath,
  onItemClick,
  onContextAction,
  getFileIcon,
}: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(item.expanded ?? false);

  const isVisible = !searchQuery || 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.children?.some(child => 
      child.name.toLowerCase().includes(searchQuery.toLowerCase())
    ));

  if (!isVisible) return null;

  const hasVisibleChildren = item.children?.some(child => 
    !searchQuery || child.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = () => {
    if (item.type === 'folder') {
      setIsExpanded(!isExpanded);
    }
    onItemClick(item);
  };

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start px-1 py-1 h-auto text-left font-normal",
              selectedPath === item.path && "bg-accent text-accent-foreground"
            )}
            style={{ paddingLeft: `${level * 12 + 4}px` }}
            onClick={handleToggle}
          >
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {item.type === 'folder' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-4 h-4 p-0 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </Button>
              )}
              <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                {getFileIcon(item)}
              </div>
              <span className="truncate text-sm">{item.name}</span>
              {item.type === 'file' && item.size && (
                <Badge variant="outline" className="ml-auto text-xs px-1 py-0 shrink-0">
                  {(() => {
                    const sizes = ['B', 'KB', 'MB'];
                    const i = Math.floor(Math.log(item.size!) / Math.log(1024));
                    return `${(item.size! / Math.pow(1024, i)).toFixed(0)}${sizes[i]}`;
                  })()}
                </Badge>
              )}
            </div>
          </Button>
        </ContextMenuTrigger>
        
        <ContextMenuContent>
          {item.type === 'file' ? (
            <>
              <ContextMenuItem onClick={() => onContextAction('open', item)}>
                <File className="w-4 h-4 mr-2" />
                Abrir
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onContextAction('copy', item)}>
                <Copy className="w-4 h-4 mr-2" />
                Copiar caminho
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onContextAction('download', item)}>
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onContextAction('rename', item)}>
                <Edit className="w-4 h-4 mr-2" />
                Renomear
              </ContextMenuItem>
              <ContextMenuItem 
                onClick={() => onContextAction('delete', item)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </ContextMenuItem>
            </>
          ) : (
            <>
              <ContextMenuItem onClick={() => onContextAction('new-file', item)}>
                <File className="w-4 h-4 mr-2" />
                Novo arquivo
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onContextAction('new-folder', item)}>
                <Folder className="w-4 h-4 mr-2" />
                Nova pasta
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onContextAction('copy', item)}>
                <Copy className="w-4 h-4 mr-2" />
                Copiar caminho
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onContextAction('rename', item)}>
                <Edit className="w-4 h-4 mr-2" />
                Renomear
              </ContextMenuItem>
              <ContextMenuItem 
                onClick={() => onContextAction('delete', item)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>

      {/* Children */}
      {item.type === 'folder' && item.children && isExpanded && hasVisibleChildren && (
        <Collapsible open={isExpanded}>
          <CollapsibleContent>
            {item.children.map((child) => (
              <FileTreeNode
                key={child.path}
                item={child}
                level={level + 1}
                searchQuery={searchQuery}
                selectedPath={selectedPath}
                onItemClick={onItemClick}
                onContextAction={onContextAction}
                getFileIcon={getFileIcon}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}