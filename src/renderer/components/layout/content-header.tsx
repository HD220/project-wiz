import { Hash, Users, type LucideIcon } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import { Separator } from "@/renderer/components/ui/separator";
import { cn } from "@/renderer/lib/utils";

import type { ReactNode } from "react";

interface ContentHeaderProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  customIcon?: ReactNode;
  showMembersToggle?: boolean;
  isMemberSidebarCollapsed?: boolean;
  onToggleMemberSidebar?: () => void;
}

export function ContentHeader(props: ContentHeaderProps) {
  const {
    title = "general",
    description = "Welcome to your workspace",
    icon: IconComponent = Hash,
    customIcon,
    showMembersToggle = false,
    isMemberSidebarCollapsed = false,
    onToggleMemberSidebar,
  } = props;

  return (
    <header className="h-14 bg-sidebar/95 backdrop-blur-sm border-b border-sidebar-border/60 flex items-center justify-between relative shadow-sm/50">
      <div className="absolute inset-0 bg-gradient-to-r from-sidebar via-sidebar/98 to-sidebar/95 pointer-events-none" />

      <div className="relative flex items-center justify-between w-full px-[var(--spacing-layout-sm)] lg:px-[var(--spacing-layout-md)]">
        <div className="flex items-center gap-[var(--spacing-component-lg)] min-w-0 flex-1">
          <div className="flex items-center gap-[var(--spacing-component-md)] min-w-0">
            {customIcon ? (
              customIcon
            ) : (
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted/30 border border-border/30">
                <IconComponent className="w-[var(--spacing-component-lg)] h-[var(--spacing-component-lg)] text-muted-foreground/80 flex-shrink-0" />
              </div>
            )}

            <h1 className="truncate text-xl font-semibold leading-tight text-sidebar-foreground">
              {title}
            </h1>
          </div>

          <Separator
            orientation="vertical"
            className="h-6 bg-sidebar-border/40 flex-shrink-0"
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-sidebar-foreground/60">
              {description}
            </p>
          </div>
        </div>

        {showMembersToggle && onToggleMemberSidebar && (
          <div className="flex items-center ml-[var(--spacing-component-lg)]">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-9 h-9",
                !isMemberSidebarCollapsed && "bg-accent text-accent-foreground",
              )}
              onClick={onToggleMemberSidebar}
              title={isMemberSidebarCollapsed ? "Show members" : "Hide members"}
            >
              <Users className="w-[var(--spacing-component-lg)] h-[var(--spacing-component-lg)]" />
            </Button>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sidebar-border/60 to-transparent" />
    </header>
  );
}
