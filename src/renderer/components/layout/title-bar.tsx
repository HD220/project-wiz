import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Square, X, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface TitleBarProps {
  className?: string;
}

export function TitleBar({ className }: TitleBarProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Check initial maximized state
    const checkMaximized = async () => {
      if (window.electronIPC?.windowIsMaximized) {
        const maximized = await window.electronIPC.windowIsMaximized();
        setIsMaximized(maximized);
      }
    };

    checkMaximized();
  }, []);

  const handleMinimize = async () => {
    if (window.electronIPC?.windowMinimize) {
      await window.electronIPC.windowMinimize();
    }
  };

  const handleMaximize = async () => {
    if (window.electronIPC?.windowMaximize) {
      await window.electronIPC.windowMaximize();
      // Toggle the state
      setIsMaximized(!isMaximized);
    }
  };

  const handleClose = async () => {
    if (window.electronIPC?.windowClose) {
      await window.electronIPC.windowClose();
    }
  };

  return (
    <div
      className={cn(
        "h-6 bg-background border-b border-border flex items-center justify-between select-none",
        className,
      )}
      style={{ WebkitAppRegion: "drag" } as any} // Allow dragging
    >
      <div className="h-6 flex-1 justify-between items-center">
        {/* Left side - Empty for now */}
        <div className="flex-1" />

        {/* Center - App title */}
        <div className="flex flex-1 items-center justify-center px-4">
          <span className="text-sm font-medium text-foreground">
            Project Wiz
          </span>
        </div>
      </div>

      {/* Right side - Window controls */}
      <div
        className="flex items-center flex-none"
        style={{ WebkitAppRegion: "no-drag" } as any}
      >
        {/* Minimize */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMinimize}
          className="h-6 w-12 rounded-none hover:bg-accent"
        >
          <Minus className="h-3 w-3" />
        </Button>

        {/* Maximize/Restore */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMaximize}
          className="h-6 w-12 rounded-none hover:bg-accent"
        >
          {isMaximized ? (
            <Copy className="h-3 w-3" />
          ) : (
            <Square className="h-3 w-3" />
          )}
        </Button>

        {/* Close */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="h-6 w-12 rounded-none bg-red-400/60 hover:bg-red-500! hover:text-white"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
