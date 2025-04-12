import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";
import { useTrustedContent } from "@/hooks/use-trusted-content";

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
 * - Delegates trust/sanitization logic to useTrustedContent hook.
 */
export function FileViewer({
  content,
  isContentTrusted = false,
  ariaLabel = "File content",
}: FileViewerProps) {
  const trusted = useTrustedContent(content, isContentTrusted);

  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div
        className="prose dark:prose-invert max-w-none"
        role="region"
        aria-label={ariaLabel}
      >
        {trusted.type === "text" ? (
          <pre
            className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md"
            aria-label="File content (plain text)"
            tabIndex={0}
          >
            {trusted.value}
          </pre>
        ) : (
          <pre
            className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md"
            aria-label="File content (sanitized HTML)"
            tabIndex={0}
            // Using dangerouslySetInnerHTML to allow rendering sanitized HTML content.
            // Sanitization is handled by useTrustedContent hook.
            dangerouslySetInnerHTML={{
              __html: trusted.value,
            }}
          />
        )}
      </div>
    </ScrollArea>
  );
}