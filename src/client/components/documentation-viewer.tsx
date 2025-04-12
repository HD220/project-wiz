import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileViewer } from "./file-viewer";
import { EmptyViewer } from "./empty-viewer";
import { Trans } from "@lingui/react/macro";
import { useRef } from "react";
import { useDocumentationFile } from "@/hooks/use-documentation-file";
import { useDocumentationFocus } from "@/hooks/use-documentation-focus";
import { useDocumentationAria } from "@/hooks/use-documentation-aria";

interface DocumentationViewerProps {
  selectedFile: string | null;
  docFiles: Array<{ path: string; name: string; lastUpdated: string }>;
  formatDate: (date: string) => string;
  selectedFileContent: string | null;
}

interface DocumentationViewerHeaderProps {
  titleId: string;
  selectedFile: string | null;
  fileName: string;
  lastUpdated: string;
  formatDate: (date: string) => string;
}

function DocumentationViewerHeader({
  titleId,
  selectedFile,
  fileName,
  lastUpdated,
  formatDate,
}: DocumentationViewerHeaderProps) {
  return (
    <CardHeader>
      <CardTitle id={titleId}>
        {selectedFile ? fileName : (
          <Trans id="documentation.viewer.selectFile" comment="Prompt to select a file">
            Select a file
          </Trans>
        )}
      </CardTitle>
      {selectedFile && (
        <CardDescription>
          <Trans id="documentation.viewer.lastUpdated" comment="Label for last updated date">
            Last updated:
          </Trans>{" "}
          {formatDate(lastUpdated)}
        </CardDescription>
      )}
    </CardHeader>
  );
}

export function DocumentationViewer({
  selectedFile,
  docFiles,
  formatDate,
  selectedFileContent,
}: DocumentationViewerProps) {
  // Get file, fileName, lastUpdated using the dedicated hook
  const { file, fileName, lastUpdated } = useDocumentationFile(selectedFile, docFiles);

  // Accessibility: generate ARIA label and IDs using the dedicated hook
  const { ariaLabel, regionId, titleId } = useDocumentationAria(file, fileName);

  // Focus management: use dedicated hook to focus card on file change
  const regionRef = useRef<HTMLDivElement>(null);
  useDocumentationFocus(regionRef as React.RefObject<HTMLElement>, selectedFile);

  return (
    <Card
      className="md:col-span-2"
      aria-label={ariaLabel}
      role="region"
      aria-labelledby={titleId}
      tabIndex={-1}
      ref={regionRef}
    >
      <DocumentationViewerHeader
        titleId={titleId}
        selectedFile={selectedFile}
        fileName={fileName}
        lastUpdated={lastUpdated}
        formatDate={formatDate}
      />
      <CardContent>
        {selectedFileContent ? (
          <FileViewer content={selectedFileContent} />
        ) : (
          <EmptyViewer />
        )}
      </CardContent>
    </Card>
  );
}