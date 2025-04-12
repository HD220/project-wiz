import { useEffect, RefObject } from "react";

/**
 * useDocumentationFocus hook
 *
 * Focuses the referenced element whenever the selectedFile changes.
 * No return value.
 *
 * Parameters:
 *   - ref: React.RefObject<HTMLElement>
 *   - selectedFile: string | null
 *
 * Clean Architecture:
 *   - No side effects beyond focusing the element.
 *   - No UI or i18n coupling.
 *   - Easily composable.
 */
export function useDocumentationFocus(
  ref: RefObject<HTMLElement>,
  selectedFile: string | null
): void {
  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, [selectedFile, ref]);
}