import { useMemo } from "react";

/**
 * useDocumentationFile hook
 *
 * Description:
 *   Selects and exposes information about a documentation file from a list, based on the selected file path.
 *   Returns the file object, its name, and last updated date, or empty values if not found.
 *
 * Clean Architecture:
 *   - Pure selector logic, no side effects, no UI or i18n coupling.
 *   - Easily testable and composable.
 *
 * Parameters:
 *   - selectedFile: string | null
 *   - docFiles: Array<{ path: string; name: string; lastUpdated: string }>
 *
 * Returns:
 *   - file: The selected file object or undefined
 *   - fileName: The name of the selected file or empty string
 *   - lastUpdated: The last updated date of the selected file or empty string
 *
 * Usage Example:
 *   const { file, fileName, lastUpdated } = useDocumentationFile(selectedFile, docFiles);
 */
type DocumentationFile = {
  path: string;
  name: string;
  lastUpdated: string;
};

type UseDocumentationFileResult = {
  file: DocumentationFile | undefined;
  fileName: string;
  lastUpdated: string;
};

export function useDocumentationFile(
  selectedFile: string | null,
  docFiles: DocumentationFile[]
): UseDocumentationFileResult {
  const file = useMemo(
    () =>
      selectedFile
        ? docFiles.find((f) => f.path === selectedFile)
        : undefined,
    [selectedFile, docFiles]
  );

  return {
    file,
    fileName: file ? file.name : "",
    lastUpdated: file ? file.lastUpdated : "",
  };
}