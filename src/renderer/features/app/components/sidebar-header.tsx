interface SidebarHeaderProps {
  title?: string;
}

export function SidebarHeader({ title = "Project Wiz" }: SidebarHeaderProps) {
  return (
    <header className="h-12 bg-card/80 backdrop-blur-sm border-b border-border/50 flex items-center justify-center px-4">
      <h1 className="text-foreground font-semibold text-base truncate">
        {title}
      </h1>
    </header>
  );
}
