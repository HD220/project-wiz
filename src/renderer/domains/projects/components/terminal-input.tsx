import { Play, Trash2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";

interface TerminalInputProps {
  command: string;
  setCommand: (cmd: string) => void;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onClear: () => void;
  isRunning: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}

export function TerminalInput({
  command,
  setCommand,
  onSubmit,
  onKeyDown,
  onClear,
  isRunning,
  inputRef,
}: TerminalInputProps) {
  return (
    <div className="flex items-center gap-2 p-3 border-t bg-muted/20">
      <span className="text-sm font-mono text-muted-foreground">$</span>

      <Input
        ref={inputRef}
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Digite um comando..."
        className="font-mono text-sm border-none bg-transparent focus-visible:ring-0"
        disabled={isRunning}
      />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onSubmit}
          disabled={!command.trim() || isRunning}
        >
          <Play className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={onClear}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
