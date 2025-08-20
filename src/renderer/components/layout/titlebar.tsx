import { Button } from "@/renderer/components/ui/button";
import { cn } from "@/renderer/lib/utils";

interface TitlebarProps {
  title?: string;
  className?: string;
}

export function Titlebar(props: TitlebarProps) {
  const { title = "Project Wiz", className } = props;

  function handleMinimize() {
    window.api.window.minimize({});
  }

  function handleMaximize() {
    window.api.window.maximize({});
  }

  function handleClose() {
    window.api.window.close({});
  }

  return (
    <div
      className={cn(
        "h-8 bg-background/95 backdrop-blur-sm flex items-center justify-between select-none border-b border-border/50",
        className,
      )}
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      role="banner"
      aria-label="Application titlebar"
    >
      <div className="flex items-center px-4">
        <span className="text-foreground text-sm font-medium">{title}</span>
      </div>

      <div
        className="flex"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        role="group"
        aria-label="Window controls"
      >
        <TitlebarButton onClick={handleMinimize} ariaLabel="Minimize window">
          <MinimizeIcon />
        </TitlebarButton>

        <TitlebarButton onClick={handleMaximize} ariaLabel="Maximize window">
          <MaximizeIcon />
        </TitlebarButton>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-12 rounded-none p-0 text-muted-foreground hover:!bg-destructive hover:!text-destructive-foreground transition-colors focus-visible:ring-1 focus-visible:ring-destructive"
          onClick={handleClose}
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
          aria-label="Close window"
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
  ariaLabel?: string;
}

function TitlebarButton({ onClick, children, ariaLabel }: TitlebarButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-12 rounded-none p-0 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus-visible:ring-1 focus-visible:ring-ring"
      onClick={onClick}
      aria-label={ariaLabel}
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
