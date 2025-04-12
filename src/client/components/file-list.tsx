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
import type { DocFile } from "../../shared/types/doc-file";
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

export function FileListEmptyState({ message }: FileListEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
      <span className="text-sm">{message ?? t`No files found.`}</span>
    </div>
  );
}

interface FileListProps {
  fileList: DocFile[];
  selectedFilePath: string | null;
  onFileSelect: (filePath: string) => void;
}

export function FileList({
  fileList,
  selectedFilePath,
  onFileSelect,
}: FileListProps) {
  const { focusedIndex, setFocusedIndex, listRef } = useKeyboardNavigation({
    itemCount: fileList.length,
    onItemSelect: (index) => {
      if (fileList[index]) {
        onFileSelect(fileList[index].path);
      }
    },
  });

  if (!fileList.length) {
    return <FileListEmptyState />;
  }

  return (
    <ScrollArea className="h-full w-full">
      <ul
        ref={listRef}
        className="flex flex-col gap-1"
        role="listbox"
        aria-label={t`Documentation files`}
      >
        {fileList.map((file, idx) => (
          <li key={file.path} role="option" aria-selected={selectedFilePath === file.path}>
            <FileListItem
              file={file}
              isSelected={selectedFilePath === file.path}
              onFileSelect={onFileSelect}
              tabIndex={0}
              ref={idx === focusedIndex ? listRef : null}
              onFocus={() => setFocusedIndex(idx)}
            />
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}