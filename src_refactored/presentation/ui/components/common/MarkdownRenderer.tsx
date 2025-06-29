import React from 'react';
import ReactMarkdown, { Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';
// import rehypeRaw from 'rehype-raw'; // Optional: if you need to render raw HTML from markdown
// For syntax highlighting:
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Choose a theme

import { cn } from '@/presentation/ui/lib/utils';

interface MarkdownRendererProps {
  content: string | null | undefined;
  className?: string; // Custom classes for the wrapper div
  proseClassName?: string; // Custom classes specifically for Tailwind Prose
  components?: Options['components']; // Allow overriding default HTML element rendering
}

export function MarkdownRenderer({
  content,
  className,
  proseClassName,
  components: customComponents,
}: MarkdownRendererProps) {
  if (content === null || content === undefined) {
    return null;
  }

  // Base prose classes for Tailwind Typography. Can be extended or overridden by `proseClassName`.
  const defaultProseSetup = cn(
    "prose prose-sm dark:prose-invert max-w-none", // General styling
    "prose-p:my-1.5 prose-headings:my-3 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5", // Spacing for common elements
    "prose-blockquote:my-2 prose-blockquote:not-italic prose-blockquote:border-l-4 prose-blockquote:pl-3 prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-400", // Blockquotes
    "prose-pre:my-2 prose-pre:p-0 prose-pre:bg-transparent prose-pre:rounded-md", // Reset <pre> for custom code block styling or syntax highlighter
    "prose-code:px-1 prose-code:py-0.5 prose-code:text-xs prose-code:font-mono prose-code:rounded prose-code:bg-slate-100 dark:prose-code:bg-slate-800", // Inline code
    "prose-a:text-sky-600 hover:prose-a:text-sky-700 dark:prose-a:text-sky-400 dark:hover:prose-a:text-sky-300 hover:prose-a:underline", // Links
    "prose-table:my-2 prose-table:text-sm prose-thead:border-b prose-th:px-2 prose-th:py-1 prose-th:font-semibold prose-td:px-2 prose-td:py-1 prose-tr:border-b", // Tables
    proseClassName, // Allow parent to provide additional/override prose classes
  );

  // Default component overrides, can be merged with or overridden by `customComponents` prop
  const defaultComponents: Options['components'] = {
    // eslint-disable-next-line id-length
    a: ({node: _node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />, // Open links in new tab

    // Custom styling for code blocks (pre > code)
    // This is a basic version. For syntax highlighting, you'd integrate react-syntax-highlighter here.
    code({ node, className: langClassName, children, ...props }) { // `node` is used here, so no underscore
      const match = /language-(\w+)/.exec(langClassName || '');
      const language = match ? match[1] : null;

      // This checks if the `<code>` is directly inside a `<pre>` (fenced code block)
      // or if it's an inline `code` snippet.
      // react-markdown v8+ typically handles inline code differently, so this check might need adjustment
      // or rely on prose-code styling for inline.
      // For explicit inline check, one might need to inspect `node.position`.
      // However, Tailwind prose usually styles inline `<code>` and `<pre><code>` differently.
      // The `prose-code:` styles above target inline code.
      // The `prose-pre:` styles reset the container for the block below.

      if (node?.parentElement?.tagName === 'pre') { // Fenced code block
        return (
          <div className="my-2 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden text-xs">
            {language && (
              <div className="px-3 py-1 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                {language}
              </div>
            )}
            {/* The `whitespace-pre-wrap` and `break-words` on the parent `prose` div should handle formatting */}
            <pre className="p-3 overflow-x-auto"><code className={cn("font-mono", langClassName)} {...props}>{children}</code></pre>
          </div>
        );
      }

      // Inline code (already styled by prose-code:)
      return (
        <code className={langClassName} {...props}>
          {children}
        </code>
      );

      // Example with react-syntax-highlighter (install it first)
      // if (node?.parentElement?.tagName === 'pre' && match) {
      //   return (
      //     <SyntaxHighlighter
      //       style={vscDarkPlus} // Choose your theme
      //       language={match[1]}
      //       PreTag="div" // Outer tag for the highlighter
      //       className="text-xs my-2"
      //       showLineNumbers // Optional
      //       wrapLines
      //       {...props}
      //     >
      //       {String(children).replace(/\n$/, '')}
      //     </SyntaxHighlighter>
      //   );
      // }
      // // Fallback for inline code or code blocks without a language
      // return (
      //   <code className={cn(langClassName, node?.parentElement?.tagName === 'pre' && "block p-2 bg-slate-100 dark:bg-slate-800 rounded overflow-x-auto text-xs")} {...props}>
      //     {children}
      //   </code>
      // );
    },
  };

  const mergedComponents = { ...defaultComponents, ...customComponents };

  return (
    <div className={cn(defaultProseSetup, className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        // rehypePlugins={[rehypeRaw]} // Uncomment if rendering raw HTML from markdown is needed and trusted
        components={mergedComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
