import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Input } from "@/ui/input";
import { ScrollArea } from "@/ui/scroll-area";
import { Search } from "lucide-react";

interface DocViewerProps {
  content: string;
  title?: string;
  isLoading?: boolean;
}

export function DocViewer({ content, title, isLoading }: DocViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedContent, setHighlightedContent] = useState(content);

  useEffect(() => {
    if (searchQuery) {
      const regex = new RegExp(`(${searchQuery})`, "gi");
      setHighlightedContent(content.replace(regex, `<mark>$1</mark>`));
    } else {
      setHighlightedContent(content);
    }
  }, [searchQuery, content]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Loading documentation...
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No documentation to display.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-800">
      {title && (
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
        </div>
      )}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search in document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        </div>
      </div>
      <ScrollArea className="flex-1 p-4 prose prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter
                  style={dracula}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            mark: ({ node, ...props }) => (
              <mark
                style={{ backgroundColor: "yellow", color: "black" }}
                {...props}
              />
            ),
          }}
        >
          {highlightedContent}
        </ReactMarkdown>
      </ScrollArea>
    </div>
  );
}
