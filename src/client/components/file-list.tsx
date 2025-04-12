/**
 * [Refactor] Standardized all prop and interface names for clarity and consistency:
 * - Renamed 'docs' to 'fileList'
 * - Renamed 'selectedFile' to 'selectedFilePath'
 * - Renamed 'onSelect' to 'onFileSelect'
 * - Updated usage of FileListItem: 'doc' to 'file', 'onSelect' to 'onFileSelect'
 * - Updated useKeyboardNavigation: 'onSelectItem' to 'onItemSelect'
 * See ISSUE-0184 and audit report for details.
 */
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DocFile } from "../hooks/use-documentation";
import { FileListItem } from "./file-list-item";
import { t } from "@lingui/macro";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";

interface FileListEmptyStateProps {
  /**
   * Optional message to display in the empty state.
   * If not provided, defaults to the i18n "No files found." message.
   */
  message?: string;
}

/**
 * Internal subcomponent responsible for presenting the empty state of the file list.
 * Handles accessibility attributes and i18n.
 */
function FileListEmptyState({ message }: FileListEmptyStateProps) {
  return (
    <div
      className="text-muted-foreground text-center py-4"
      role="status"
      aria-live="polite"
    >
      {message ?? t`fileList.noFiles`}
    </div>
  );
}

interface FileListProps {
  fileList: DocFile[];
  selectedFilePath: string | null;
  onFileSelect: (filePath: string) => void;
}

export function FileList({ fileList, selectedFilePath, onFileSelect }: FileListProps) {
  // Keyboard navigation and selection integration
  const { getItemProps } = useKeyboardNavigation({
    itemCount: fileList.length,
    onItemSelect: (idx) => {
      if (fileList[idx]) {
        onFileSelect(fileList[idx].path);
      }
    },
  });

  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="space-y-1" role="list">
        {fileList.length === 0 ? (
          <FileListEmptyState />
        ) : (
          fileList.map((file, idx) => (
            <FileListItem
              key={file.id}
              file={file}
              isSelected={selectedFilePath === file.path}
              onFileSelect={onFileSelect}
              {...getItemProps(idx)}
            />
          ))
        )}
      </div>
    </ScrollArea>
  );
}