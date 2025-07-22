import { Button } from "@/renderer/components/ui/button";
import { cn } from "@/renderer/lib/utils";

interface TitlebarProps {
  title?: string;
  className?: string;
}

function Titlebar(props: TitlebarProps) {
  const { title = "Project Wiz", className } = props;

  function handleMinimize() {
    window.electronAPI?.window.minimize();
  }

  function handleMaximize() {
    window.electronAPI?.window.toggleMaximize();
  }

  function handleClose() {
    window.electronAPI?.window.close();
  }

  return (
    <div
      className={cn(
        "h-8 bg-[#202225] flex items-center justify-between select-none border-b border-[#36393f]",
        className,
      )}
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      <div className="flex items-center px-3">
        <span className="text-white text-sm font-medium">{title}</span>
      </div>

      <div
        className="flex"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <TitlebarButton onClick={handleMinimize}>
          <MinimizeIcon />
        </TitlebarButton>

        <TitlebarButton onClick={handleMaximize}>
          <MaximizeIcon />
        </TitlebarButton>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-12 rounded-none p-0 text-white/70 hover:!bg-destructive hover:!text-destructive-foreground transition-colors"
          onClick={handleClose}
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <CloseIcon />
        </Button>
      </div>
    </div>
  );
}

interface TitlebarButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

function TitlebarButton({ onClick, children }: TitlebarButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-12 rounded-none p-0 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function MinimizeIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3.5 8a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 013.5 8z" />
    </svg>
  );
}

function MaximizeIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2.5 3.25a.75.75 0 01.75-.75h9.5a.75.75 0 01.75.75v9.5a.75.75 0 01-.75.75h-9.5a.75.75 0 01-.75-.75v-9.5zm1.5.75v8h8v-8h-8z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
    </svg>
  );
}

export { Titlebar };
