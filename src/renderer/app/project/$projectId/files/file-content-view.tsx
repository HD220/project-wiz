import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileTreeItem } from "@/lib/placeholders";

import { getFilePreview } from "./file-preview-utils";

interface FileContentViewProps {
  selectedFile: FileTreeItem | null;
}

export function FileContentView({ selectedFile }: FileContentViewProps) {
  if (!selectedFile) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">
            Nenhum arquivo selecionado
          </h3>
          <p className="text-muted-foreground">
            Selecione um arquivo no explorador para visualizá-lo aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
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
                  <pre className="text-sm">{getFilePreview(selectedFile)}</pre>
                </div>

                {selectedFile.size && (
                  <div className="text-sm text-muted-foreground">
                    Tamanho: {(selectedFile.size / 1024).toFixed(1)} KB
                  </div>
                )}

                {selectedFile.lastModified && (
                  <div className="text-sm text-muted-foreground">
                    Última modificação:{" "}
                    {selectedFile.lastModified.toLocaleString("pt-BR")}
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
    </div>
  );
}
