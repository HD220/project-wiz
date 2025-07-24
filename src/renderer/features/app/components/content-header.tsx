import { Hash, Users, type LucideIcon } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import { Separator } from "@/renderer/components/ui/separator";
import { cn } from "@/renderer/lib/utils";

interface ContentHeaderProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  showMembersToggle?: boolean;
  isMemberSidebarCollapsed?: boolean;
  onToggleMemberSidebar?: () => void;
}

function ContentHeader(props: ContentHeaderProps) {
  const {
    title = "general",
    description = "Welcome to your workspace",
    icon: IconComponent = Hash,
    showMembersToggle = false,
    isMemberSidebarCollapsed = false,
    onToggleMemberSidebar,
  } = props;

  return (
    <header className="h-12 bg-background border-b flex items-center px-4 justify-between shadow-sm">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0">
          <IconComponent className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <h1 className="text-foreground font-semibold truncate">{title}</h1>
        </div>

        <Separator orientation="vertical" className="h-6 flex-shrink-0" />

        <p className="text-sm text-muted-foreground/80 truncate">
          {description}
        </p>
      </div>

      {/* Members Toggle */}
      {showMembersToggle && onToggleMemberSidebar && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "w-8 h-8 transition-colors hover:bg-accent/80 flex-shrink-0",
            !isMemberSidebarCollapsed &&
              "bg-accent text-accent-foreground hover:bg-accent",
          )}
          onClick={onToggleMemberSidebar}
          title={
            isMemberSidebarCollapsed ? "Mostrar membros" : "Ocultar membros"
          }
        >
          <Users className="w-4 h-4" />
        </Button>
      )}
    </header>
  );
}

export { ContentHeader };
