/**
 * [Refactor] Standardized all prop and interface names for clarity and consistency:
 * - Renamed 'doc' to 'file'
 * - Renamed 'onSelect' to 'onFileSelect'
 * - Updated usage and interface accordingly
 * See ISSUE-0184 and audit report for details.
 */
import React from "react";
import { Button } from "@/components/ui/button";
import type { DocFile } from "../hooks/use-documentation";
import { useLingui } from "@lingui/react";

interface FileListItemProps {
  file: DocFile;
  isSelected: boolean;
  onFileSelect: (filePath: string) => void;
  // Keyboard navigation props (ref, onKeyDown, tabIndex, onFocus, etc)
  [key: string]: any;
}

interface FileIconProps {
  ariaLabel?: string;
}

/**
 * Internal subcomponent for displaying file name and path.
 * Receives 'name' and 'path' as props and is responsible only for data presentation.
 */
const FileListItemInfo: React.FC<{ name: string; path: string }> = ({ name, path }) => (
  <div>
    <div className="font-medium">{name}</div>
    <div className="text-xs text-muted-foreground">{path}</div>
  </div>
);

const FileIcon: React.FC<FileIconProps> = ({ ariaLabel }) => {
  // i18n is expected to be available in the parent scope, so we require it as a prop or context.
  // Since i18n is only available in FileListItem, we will pass it as a prop from there.
  // However, to keep FileIcon isolated, we use React context to access i18n.
  // But since the instruction says "internal subcomponent" and i18n is available in the parent,
  // we can use a closure to access i18n from FileListItem.

  // This implementation expects i18n to be available in the closure scope.
  // The actual i18n instance will be provided by the parent component.
  // This is a pattern for internal subcomponents.

  // The actual implementation will be injected below in FileListItem.

  return null;
};

export const FileListItem = React.forwardRef<HTMLButtonElement, FileListItemProps>(
  ({ file, isSelected, onFileSelect, ...navProps }, ref) => {
    const { i18n } = useLingui();

    // Internal FileIcon subcomponent with i18n in closure
    const FileIcon: React.FC<FileIconProps> = ({ ariaLabel }) => {
      const label =
        ariaLabel ??
        i18n._("fileListItem.fileIcon", {}, { message: "File icon" });

      return (
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
          role="img"
          aria-label={label}
        >
          <title>{label}</title>
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
    };

    return (
      <Button
        ref={ref}
        variant={isSelected ? "secondary" : "ghost"}
        className="w-full justify-start text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
        onClick={() => onFileSelect(file.path)}
        role="listitem"
        aria-selected={isSelected}
        {...navProps}
      >
        <FileIcon />
        <FileListItemInfo name={file.name} path={file.path} />
      </Button>
    );
  }
);

FileListItem.displayName = "FileListItem";