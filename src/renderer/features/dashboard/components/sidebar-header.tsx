interface SidebarHeaderProps {
  title?: string;
}

export function SidebarHeader({ title = "Project Wiz" }: SidebarHeaderProps) {
  return (
    <div className="h-12 bg-card border-b flex items-center justify-center">
      <h1 className="text-foreground font-semibold">{title}</h1>
    </div>
  );
}