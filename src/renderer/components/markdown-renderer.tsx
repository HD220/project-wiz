import ReactMarkdown from "react-markdown";

import { cn } from "@/lib/utils";

import {
  MarkdownComponents,
  CodeComponents,
  LinkComponents,
} from "./markdown-renderer/markdown-components";
import {
  remarkPlugins,
  rehypePlugins,
  getMarkdownClasses,
} from "./markdown-renderer/markdown-config";
import { TableComponents } from "./markdown-renderer/markdown-tables";
import { MarkdownRendererProps } from "./markdown-renderer/markdown-types";

export function MarkdownRenderer(props: MarkdownRendererProps) {
  const { content, className, compact = false } = props;

  return (
    <div className={cn(getMarkdownClasses(compact), className)}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={{
          ...MarkdownComponents,
          ...CodeComponents,
          ...LinkComponents,
          ...TableComponents,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
