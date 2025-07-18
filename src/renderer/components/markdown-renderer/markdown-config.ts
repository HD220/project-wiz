import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

export const remarkPlugins = [remarkGfm];
export const rehypePlugins = [rehypeHighlight, rehypeSanitize];

export function getMarkdownClasses(compact = false): string {
  return compact
    ? "prose prose-sm prose-slate dark:prose-invert max-w-none"
    : "prose prose-slate dark:prose-invert max-w-none";
}
