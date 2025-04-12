import { useState } from "react";
import type { DocFile } from "../../shared/types/doc-file";
import { filterDocsBySearchTerm, getDocContentByPath } from "../lib/documentation-utils";
import { formatDate } from "../lib/utils";

/**
 * Hook for managing documentation search and file selection state.
 * Receives the list of documentation files as a parameter.
 */
export interface UseDocumentationResult {
  /** Current search term */
  searchTerm: string;
  /** Updates the search term */
  setSearchTerm: (term: string) => void;
  /** Currently selected file path (or null) */
  selectedFile: string | null;
  /** Updates the selected file path */
  setSelectedFile: (path: string | null) => void;
  /** Filtered documentation files based on the search term */
  filteredDocs: DocFile[];
  /** Returns the content of the selected file, or null if none is selected */
  getSelectedFileContent: () => string | null;
}

/**
 * Returns documentation search/filter state and helpers.
 */
export function useDocumentation(docFiles: DocFile[]): UseDocumentationResult {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const filteredDocs = filterDocsBySearchTerm(docFiles, searchTerm);

  function getSelectedFileContent() {
    return getDocContentByPath(docFiles, selectedFile);
  }

  return {
    searchTerm,
    setSearchTerm,
    selectedFile,
    setSelectedFile,
    filteredDocs,
    getSelectedFileContent,
  };
}