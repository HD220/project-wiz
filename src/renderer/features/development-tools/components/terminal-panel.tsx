import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Play,
  Square,
  Trash2,
  Copy,
  Settings,
  Plus,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { TerminalLine, mockTerminalLines } from "@/lib/placeholders";
import { cn } from "@/lib/utils";

interface TerminalPanelProps {
  className?: string;
  defaultHeight?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function TerminalPanel({
  className,
  defaultHeight = 300,
  isCollapsed = false,
  onToggleCollapse,
}: TerminalPanelProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [tabs, setTabs] = useState([
    { id: 1, name: "Terminal 1", isActive: true },
  ]);
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [terminalLines, setTerminalLines] =
    useState<TerminalLine[]>(mockTerminalLines);
  const [isRunning, setIsRunning] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new lines are added
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [terminalLines]);

  const handleCommand = () => {
    if (!command.trim()) return;

    // Add command to history
    setCommandHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);

    // Add command line to terminal
    const newCommandLine: TerminalLine = {
      id: `cmd-${Date.now()}`,
      content: command,
      type: "command",
      timestamp: new Date(),
    };

    setTerminalLines((prev) => [...prev, newCommandLine]);
    setIsRunning(true);

    // Simulate command execution
    setTimeout(
      () => {
        const outputLine: TerminalLine = {
          id: `out-${Date.now()}`,
          content: simulateCommandOutput(command),
          type: "output",
          timestamp: new Date(),
        };

        setTerminalLines((prev) => [...prev, outputLine]);
        setIsRunning(false);
      },
      1000 + Math.random() * 2000,
    );

    setCommand("");
  };

  const simulateCommandOutput = (cmd: string): string => {
    const lowerCmd = cmd.toLowerCase().trim();

    if (lowerCmd === "ls") {
      return "src/\npackage.json\nREADME.md\nnode_modules/\n.git/";
    } else if (lowerCmd.startsWith("cd ")) {
      return "";
    } else if (lowerCmd === "pwd") {
      return "/home/user/project-wiz";
    } else if (lowerCmd === "git status") {
      return "On branch main\nYour branch is up to date with 'origin/main'.\n\nnothing to commit, working tree clean";
    } else if (lowerCmd.startsWith("npm ")) {
      return "npm command executed successfully";
    } else if (lowerCmd === "clear") {
      setTerminalLines([]);
      return "";
    } else if (lowerCmd === "help") {
      return "Available commands: ls, cd, pwd, git, npm, clear, help";
    }
    return `Command '${cmd}' executed`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCommand("");
        } else {
          setHistoryIndex(newIndex);
          setCommand(commandHistory[newIndex]);
        }
      }
    }
  };

  const addNewTab = () => {
    const newTab = {
      id: Date.now(),
      name: `Terminal ${tabs.length + 1}`,
      isActive: false,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTab(tabs.length);
  };

  const closeTab = (index: number) => {
    if (tabs.length === 1) return;

    setTabs((prev) => prev.filter((_, i) => i !== index));
    if (activeTab >= index && activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  const clearTerminal = () => {
    setTerminalLines([]);
  };

  const getLineColor = (type: TerminalLine["type"]) => {
    switch (type) {
      case "command":
        return "text-blue-400";
      case "error":
        return "text-red-400";
      case "output":
        return "text-green-400";
      default:
        return "text-green-400";
    }
  };

  if (isCollapsed) {
    return (
      <div
        className={cn(
          "h-10 bg-card border-t border-border flex items-center px-4",
          className,
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Terminal
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-black text-green-400 font-mono text-sm flex flex-col",
        className,
      )}
      style={{ height: defaultHeight }}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between p-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-1">
          {/* Terminal Controls */}
          <div className="flex gap-1 mr-3">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {tabs.map((tab, index) => (
              <div
                key={tab.id}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer",
                  activeTab === index
                    ? "bg-black text-green-400"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700",
                )}
                onClick={() => setActiveTab(index)}
              >
                <span>{tab.name}</span>
                {tabs.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-3 h-3 p-0 hover:bg-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(index);
                    }}
                  >
                    <X className="w-2 h-2" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 p-0 text-gray-400 hover:text-green-400"
              onClick={addNewTab}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Terminal Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 p-0 text-gray-400 hover:text-green-400"
            onClick={clearTerminal}
            title="Limpar terminal"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 p-0 text-gray-400 hover:text-green-400"
            title="Configurações"
          >
            <Settings className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 p-0 text-gray-400 hover:text-green-400"
            onClick={onToggleCollapse}
            title="Minimizar"
          >
            <Minimize2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Terminal Content */}
      <ScrollArea className="flex-1 p-2" ref={scrollAreaRef}>
        <div className="space-y-1">
          {terminalLines.map((line) => (
            <div
              key={line.id}
              className={cn("font-mono text-sm", getLineColor(line.type))}
            >
              {line.type === "command" && (
                <span className="text-blue-400">$ </span>
              )}
              <span className="whitespace-pre-wrap">{line.content}</span>
            </div>
          ))}

          {/* Current command line */}
          <div className="flex items-center">
            <span className="text-blue-400">$ </span>
            <Input
              ref={inputRef}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none text-green-400 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto font-mono"
              placeholder={isRunning ? "Executando..." : "Digite um comando..."}
              disabled={isRunning}
              autoFocus
            />
            {isRunning && (
              <Badge
                variant="outline"
                className="ml-2 text-xs border-green-400 text-green-400"
              >
                Executando...
              </Badge>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Status Bar */}
      <div className="h-6 bg-gray-900 border-t border-gray-700 flex items-center justify-between px-2 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-gray-400">Terminal {activeTab + 1}</span>
          <span className="text-gray-400">~/project-wiz</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">{terminalLines.length} linhas</span>
          {isRunning && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400">Executando</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
