import { useMemo } from "react";
import DOMPurify from "dompurify";

/**
 * Hook to handle trusted and untrusted file content rendering.
 * - If content is trusted, returns as plain text.
 * - If not trusted, returns sanitized HTML.
 *
 * @param content The file content to display.
 * @param isContentTrusted If true, content is considered safe and will be rendered as plain text.
 * @returns { type: "text" | "html", value: string }
 */
export function useTrustedContent(content: string, isContentTrusted: boolean = false) {
  return useMemo(() => {
    if (isContentTrusted) {
      return { type: "text", value: content };
    }
    return { type: "html", value: DOMPurify.sanitize(content) };
  }, [content, isContentTrusted]);
}