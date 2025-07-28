interface SidebarHeaderProps {
  title?: string;
}

export function SidebarHeader({ title = "Project Wiz" }: SidebarHeaderProps) {
  return (
    <header className="h-12 bg-sidebar/95 backdrop-blur-md border-b border-sidebar-border/60 flex items-center justify-center px-[var(--spacing-component-md)]">
      <h1 className="text-sidebar-foreground font-semibold text-base truncate">
        {title}
      </h1>
    </header>
  );
}
