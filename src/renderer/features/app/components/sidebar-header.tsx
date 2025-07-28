interface SidebarHeaderProps {
  title?: string;
}

export function SidebarHeader({ title = "Project Wiz" }: SidebarHeaderProps) {
  return (
    <header
      className="relative bg-sidebar/95 backdrop-blur-md border-b border-sidebar-border/60 flex items-center justify-center shadow-sm/50 px-[var(--spacing-component-lg)]"
      style={{
        height:
          "calc(var(--spacing-component-2xl) + var(--spacing-component-lg))",
      }}
    >
      {/* Background gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-sidebar via-sidebar/98 to-sidebar/95 pointer-events-none" />

      {/* Content with enhanced typography */}
      <div className="relative z-10 flex items-center justify-center w-full">
        <h1
          className="truncate text-center transition-colors duration-200"
          style={{
            fontSize: "var(--font-size-lg)",
            fontWeight: "var(--font-weight-bold)",
            lineHeight: "var(--line-height-tight)",
            color: "hsl(var(--sidebar-foreground))",
          }}
        >
          {title}
        </h1>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sidebar-border/60 to-transparent" />
    </header>
  );
}
