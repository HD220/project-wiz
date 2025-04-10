import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDocumentation } from "./use-documentation";
import { ExportButton } from "./export-button";
import { RefreshButton } from "./refresh-button";
import { FileList } from "./file-list";
import { FileViewer } from "./file-viewer";
import { EmptyViewer } from "./empty-viewer";

export default function Documentation() {
  const {
    searchTerm,
    setSearchTerm,
    selectedFile,
    setSelectedFile,
    docFiles,
    filteredDocs,
    formatDate,
    selectedFileContent,
  } = useDocumentation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Documentation</h2>
        <div className="flex items-center gap-2">
          <ExportButton />
          <RefreshButton />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search documentation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Documentation Files</CardTitle>
            <CardDescription>Files in /docs directory</CardDescription>
          </CardHeader>
          <CardContent>
            <FileList
              docs={filteredDocs}
              selectedFile={selectedFile}
              onSelect={setSelectedFile}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedFile
                ? docFiles.find((doc) => doc.path === selectedFile)?.name
                : "Select a file"}
            </CardTitle>
            {selectedFile && (
              <CardDescription>
                Last updated:{" "}
                {formatDate(
                  docFiles.find((doc) => doc.path === selectedFile)
                    ?.lastUpdated || ""
                )}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {selectedFileContent ? (
              <FileViewer content={selectedFileContent} />
            ) : (
              <EmptyViewer />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
