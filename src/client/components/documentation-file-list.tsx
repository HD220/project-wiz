/**
 * [Refactor] Standardized all prop and interface names for clarity and consistency:
 * - Renamed 'docs' to 'fileList'
 * - Renamed 'selectedFile' to 'selectedFilePath'
 * - Renamed 'onSelect' to 'onFileSelect'
 * - Updated usage and interface accordingly
 * See ISSUE-0184 and audit report for details.
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileList } from "./file-list";
import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react";

interface DocumentationFileListProps {
  fileList: Array<any>;
  selectedFilePath: string | null;
  onFileSelect: (filePath: string) => void;
}

export function DocumentationFileList({ fileList, selectedFilePath, onFileSelect }: DocumentationFileListProps) {
  const { i18n } = useLingui();
  return (
    <Card
      className="md:col-span-1"
      aria-label={i18n._(/*i18n*/ "documentation.files.title", {}, { comment: "Title for documentation files list", message: "Documentation Files" })}
      role="region"
    >
      <CardHeader>
        <CardTitle>
          <Trans id="documentation.files.title" comment="Title for documentation files list">
            Documentation Files
          </Trans>
        </CardTitle>
        <CardDescription>
          <Trans id="documentation.files.description" comment="Description for documentation files list">
            Files in /docs directory
          </Trans>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FileList
          fileList={fileList}
          selectedFilePath={selectedFilePath}
          onFileSelect={onFileSelect}
        />
      </CardContent>
    </Card>
  );
}