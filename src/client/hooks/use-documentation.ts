import { useState } from "react";
import type { DocFile } from "../mocks/mock-doc-files";
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
  selectedFileContent: string | null;
  /** Formats a date string for display */
  formatDate: (dateString: string) => string;
}

/**
 * useDocumentation hook
 * @param docFiles Array of documentation files
 * @returns State and helpers for documentation search and selection
 */
export function useDocumentation(docFiles: DocFile[]): UseDocumentationResult {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const filteredDocs = filterDocsBySearchTerm(docFiles, searchTerm);
  const selectedFileContent = getDocContentByPath(docFiles, selectedFile);

  return {
    searchTerm,
    setSearchTerm,
    selectedFile,
    setSelectedFile,
    filteredDocs,
    selectedFileContent,
    formatDate,
  };
}