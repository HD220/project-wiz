import { Info } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface MessageContentProps {
  content: string;
  messageType: "text" | "task_update" | "system" | "file_share" | "code";
  mentions?: string[];
}

export function MessageContent({
  content,
  messageType,
  mentions,
}: MessageContentProps) {
  const processedContent = processMentions(content, mentions);

  if (messageType === "system") {
    return <SystemMessage content={content} />;
  }

  return <RegularMessage content={processedContent} />;
}

function processMentions(content: string, mentions?: string[]): string {
  if (!mentions) return content;

  let result = content;
  mentions.forEach((mention) => {
    result = result.replace(
      new RegExp(`@${mention}`, "g"),
      `<span class="bg-brand-500/20 text-brand-400 px-1 rounded">@${mention}</span>`,
    );
  });
  return result;
}

function SystemMessage({ content }: { content: string }) {
  return (
    <div className="bg-blue-900/20 border-l-4 border-blue-500 p-3 rounded-r">
      <div className="flex items-center space-x-2">
        <Info className="h-4 w-4 text-blue-500" />
        <div className="text-blue-300 prose prose-sm prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            children={content}
          />
        </div>
      </div>
    </div>
  );
}

function RegularMessage({ content }: { content: string }) {
  return (
    <div className="text-gray-300 prose prose-sm prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        children={content}
      />
    </div>
  );
}
