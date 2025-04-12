import React from "react";

interface FileListItemInfoProps {
  name: string;
  path: string;
}

/**
 * Displays file name and path.
 * Pure presentational component.
 */
export const FileListItemInfo: React.FC<FileListItemInfoProps> = ({ name, path }) => (
  <div>
    <div className="font-medium">{name}</div>
    <div className="text-xs text-muted-foreground">{path}</div>
  </div>
);