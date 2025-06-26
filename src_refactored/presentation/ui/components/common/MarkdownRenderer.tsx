import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
// Note: To make rehype-highlight work, you might need to import a stylesheet for your chosen theme,
// e.g., import 'highlight.js/styles/github.css'; or 'highlight.js/styles/atom-one-dark.css';
// This should ideally be done globally or scoped to where the markdown is rendered.
// For now, we'll rely on Tailwind or default browser styles for pre/code if no global HLJS CSS is present.

interface MarkdownRendererProps {
  children: string; // The markdown content as a string
  className?: string; // Optional className for the wrapper div
}

/**
 * A component to render Markdown content securely with GFM support and syntax highlighting.
 * It uses react-markdown with remark-gfm for GitHub Flavored Markdown,
 * rehype-sanitize for XSS protection, and rehype-highlight for code block syntax highlighting.
 */
export function MarkdownRenderer({ children, className }: MarkdownRendererProps) {
  // Customize the sanitization schema if needed.
  // For example, to allow iframes from specific domains or add custom tags.
  // The defaultSchema is generally good for security.
  // Here, we extend it to ensure `className` is allowed on `code` elements for highlighting.
  const schema = {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      code: [...(defaultSchema.attributes?.code || []), 'className', 'class'], // class for hljs
      span: [...(defaultSchema.attributes?.span || []), 'className', 'class'], // class for hljs
      pre: [...(defaultSchema.attributes?.pre || []), 'className', 'class'], // class for hljs
    },
  };

  return (
    <ReactMarkdown
      className={`prose dark:prose-invert max-w-none ${className || ''}`} // Basic prose styling with Tailwind Typography
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        [rehypeSanitize, schema],
        [rehypeHighlight, { detect: true, ignoreMissing: true }], // detect will try to guess language, ignoreMissing prevents errors
      ]}
      // Optionally, provide custom components for rendering specific HTML elements
      // components={{
      //   a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" {...props} />,
      //   // Example: Custom styling for code blocks if rehype-highlight is not enough
      //   code({node, inline, className, children, ...props}) {
      //     const match = /language-(\w+)/.exec(className || '')
      //     return !inline && match ? (
      //       <SyntaxHighlighter style={atomDark} language={match[1]} PreTag="div" {...props}>
      //         {String(children).replace(/\n$/, '')}
      //       </SyntaxHighlighter>
      //     ) : (
      //       <code className={className} {...props}>
      //         {children}
      //       </code>
      //     )
      //   }
      // }}
    >
      {children}
    </ReactMarkdown>
  );
}

export default MarkdownRenderer;
