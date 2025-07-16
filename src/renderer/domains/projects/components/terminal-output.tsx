import { ScrollArea } from "../../../../components/ui/scroll-area";
import { Badge } from "../../../../components/ui/badge";
import { cn } from "../../../../lib/utils";
import type { TerminalLine } from "../../../../lib/placeholders";

interface TerminalOutputProps {
  terminalLines: TerminalLine[];
  isRunning: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
}

export function TerminalOutput({
  terminalLines,
  isRunning,
  scrollAreaRef,
}: TerminalOutputProps) {
  const getLineStyle = (type: TerminalLine["type"]) => {
    switch (type) {
      case "command":
        return "text-blue-400 font-medium";
      case "output":
        return "text-foreground";
      case "error":
        return "text-red-400";
      case "warning":
        return "text-yellow-400";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
      <div className="space-y-1 font-mono text-sm">
        {terminalLines.map((line) => (
          <div
            key={line.id}
            className={cn("flex items-start gap-2", getLineStyle(line.type))}
          >
            <span className="whitespace-pre-wrap break-all">{line.text}</span>
            {line.type === "error" && (
              <Badge variant="destructive" className="text-xs">
                Error
              </Badge>
            )}
            {line.type === "warning" && (
              <Badge variant="secondary" className="text-xs">
                Warning
              </Badge>
            )}
          </div>
        ))}

        {isRunning && (
          <div className="text-muted-foreground animate-pulse">
            Executando comando...
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
