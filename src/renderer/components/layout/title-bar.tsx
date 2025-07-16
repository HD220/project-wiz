import { Minus, Square, X, Copy } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TitleBarProps {
  className?: string;
}

function useWindowState() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const checkMaximized = async () => {
      if (window.electronIPC?.window?.isMaximized) {
        const maximized = await window.electronIPC.window.isMaximized();
        setIsMaximized(maximized);
      }
    };

    checkMaximized();
  }, []);

  return { isMaximized, setIsMaximized };
}

function WindowControls({
  isMaximized,
  setIsMaximized,
}: {
  isMaximized: boolean;
  setIsMaximized: (maximized: boolean) => void;
}) {
  const handleMinimize = async () => {
    if (window.electronIPC?.window?.minimize) {
      await window.electronIPC.window.minimize();
    }
  };

  const handleMaximize = async () => {
    if (window.electronIPC?.window?.maximize) {
      await window.electronIPC.window.maximize();
      setIsMaximized(!isMaximized);
    }
  };

  const handleClose = async () => {
    if (window.electronIPC?.window?.close) {
      await window.electronIPC.window.close();
    }
  };

  return (
    <div
      className="flex items-center flex-none"
      style={{ WebkitAppRegion: "no-drag" } as any}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={handleMinimize}
        className="h-6 w-12 rounded-none hover:bg-accent"
      >
        <Minus className="h-3 w-3" />
      </Button>

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

      <Button
        variant="ghost"
        size="icon"
        onClick={handleClose}
        className="h-6 w-12 rounded-none bg-red-400/60 hover:bg-red-500! hover:text-white"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function TitleBar({ className }: TitleBarProps) {
  const { isMaximized, setIsMaximized } = useWindowState();

  return (
    <div
      className={cn(
        "h-6 bg-background border-b border-border flex items-center justify-between select-none",
        className,
      )}
      style={{ WebkitAppRegion: "drag" } as any}
    >
      <div className="h-6 flex-1 justify-between items-center">
        <div className="flex-1" />

        <div className="flex flex-1 items-center justify-center px-4">
          <span className="text-sm font-medium text-foreground">
            Project Wiz
          </span>
        </div>
      </div>

      <WindowControls
        isMaximized={isMaximized}
        setIsMaximized={setIsMaximized}
      />
    </div>
  );
}
