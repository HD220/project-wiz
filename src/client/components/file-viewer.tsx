import { ScrollArea } from "@/components/ui/scroll-area";
import DOMPurify from "dompurify";
import React from "react";

interface FileViewerProps {
  content: string;
  /**
   * If true, content is considered trusted and will be rendered as plain text.
   * If false or undefined, content will be sanitized and rendered as HTML to prevent XSS.
   */
  isContentTrusted?: boolean;
  /**
   * Optional label for accessibility. If not provided, a default will be used.
   */
  ariaLabel?: string;
}

/**
 * FileViewer component displays file content securely and accessibly.
 * - Adds role="region" and aria-label for assistive technologies.
 * - Ensures <pre> is focusable for keyboard navigation and text selection.
 * - Sanitizes HTML content if not trusted.
 */
export function FileViewer({
  content,
  isContentTrusted = false,
  ariaLabel = "File content",
}: FileViewerProps) {
  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div
        className="prose dark:prose-invert max-w-none"
        role="region"
        aria-label={ariaLabel}
      >
        {isContentTrusted ? (
          <pre
            className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md"
            aria-label="File content (plain text)"
            tabIndex={0}
          >
            {content}
          </pre>
        ) : (
          <pre
            className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md"
            aria-label="File content (sanitized HTML)"
            tabIndex={0}
            // Using dangerouslySetInnerHTML to allow rendering sanitized HTML content.
            // DOMPurify ensures that any potentially dangerous HTML is removed.
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(content),
            }}
          />
        )}
      </div>
    </ScrollArea>
  );
}