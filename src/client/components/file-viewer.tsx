import { ScrollArea } from "@/components/ui/scroll-area";

interface FileViewerProps {
  content: string;
}

export function FileViewer({ content }: FileViewerProps) {
  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="prose dark:prose-invert max-w-none">
        <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md">
          {content}
        </pre>
      </div>
    </ScrollArea>
  );
}