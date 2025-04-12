/**
 * [Refactor] Standardized all prop and interface names for clarity and consistency:
 * - Renamed 'onSelect' to 'onFileSelect'
 * - Renamed 'initialSelected' to 'initialSelectedFilePath'
 * - Renamed 'selectedFile' to 'selectedFilePath'
 * - Renamed 'selectFile' to 'selectFilePath'
 * - Updated comments and usage accordingly
 * See ISSUE-0184 and audit report for details.
 */

/**
 * useFileSelection hook
 *
 * Description:
 *   Manages the selection state for a file in a list context (e.g., documentation files).
 *   Designed to be UI-agnostic, i18n-agnostic, and easily integrated with list components.
 *   Allows external callback integration (e.g., for navigation, analytics, or side effects).
 *
 * Dependencies & Integration Points:
 *   - Does NOT handle UI, focus, or keyboard navigation.
 *   - Can be integrated with keyboard navigation logic by calling selectFilePath from event handlers.
 *   - Can be used with any file type (string, object, etc.) via generic parameter.
 *   - External callback (onFileSelect) is called after selection changes.
 *
 * Usage Example:
 *   const { selectedFilePath, selectFilePath } = useFileSelection<FileType>({
 *     onFileSelect: (file) => { ... }
 *   });
 *
 * Clean Architecture:
 *   - No coupling to UI, i18n, or navigation.
 *   - Pure state management, easily testable.
 */

import { useCallback, useState } from "react";

export type UseFileSelectionOptions<T> = {
  /**
   * Optional callback called when a file is selected.
   * Receives the selected file as argument.
   */
  onFileSelect?: (file: T | null) => void;
  /**
   * Optional initial selected file.
   */
  initialSelectedFilePath?: T | null;
};

export type UseFileSelectionResult<T> = {
  /**
   * The currently selected file (or null if none).
   */
  selectedFilePath: T | null;
  /**
   * Selects a file. Triggers onFileSelect callback if provided.
   */
  selectFilePath: (file: T | null) => void;
};

/**
 * Hook to manage file selection state in a list context.
 * Generic and decoupled from UI, i18n, and navigation.
 */
export function useFileSelection<T = string>(
  options: UseFileSelectionOptions<T> = {}
): UseFileSelectionResult<T> {
  const { onFileSelect, initialSelectedFilePath = null } = options;
  const [selectedFilePath, setSelectedFilePath] = useState<T | null>(initialSelectedFilePath);

  const selectFilePath = useCallback(
    (file: T | null) => {
      setSelectedFilePath(file);
      if (onFileSelect) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return {
    selectedFilePath,
    selectFilePath,
  };
}