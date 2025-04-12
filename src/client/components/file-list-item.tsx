import React from "react";
import { Button } from "@/components/ui/button";
import type { DocFile } from "../../shared/types/doc-file";
import { useLingui } from "@lingui/react";
import { FileListItemInfo } from "./file-list-item-info";
import { FileIcon } from "./file-icon";

interface FileListItemProps {
  file: DocFile;
  isSelected: boolean;
  onFileSelect: (filePath: string) => void;
  // Keyboard navigation props (ref, onKeyDown, tabIndex, onFocus, etc)
  [key: string]: any;
}

/**
 * FileListItem component.
 * Uses modular subcomponents for icon and file info.
 */
export const FileListItem = React.forwardRef<HTMLButtonElement, FileListItemProps>(
  // ...restante do componente
);