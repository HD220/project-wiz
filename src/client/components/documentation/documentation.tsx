import { useDocumentation } from "../hooks/use-documentation";
import { DocumentationHeader } from "./documentation-header";
import { DocumentationSearch } from "./documentation-search";
import { DocumentationFileList } from "./documentation-file-list";
import { DocumentationViewer } from "./documentation-viewer";

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
      <DocumentationHeader />
      <DocumentationSearch value={searchTerm} onChange={setSearchTerm} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DocumentationFileList
          docs={filteredDocs}
          selectedFile={selectedFile}
          onSelect={setSelectedFile}
        />
        <DocumentationViewer
          selectedFile={selectedFile}
          docFiles={docFiles}
          formatDate={formatDate}
          selectedFileContent={selectedFileContent ?? null}
        />
      </div>
    </div>
  );
}
