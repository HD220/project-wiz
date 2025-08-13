import { SidebarUserArea } from "@/renderer/components/app/sidebar-user-area";
import { SidebarHeader } from "@/renderer/components/layout/navigation/sidebar-header";
import { SidebarNavigation } from "@/renderer/components/layout/navigation/sidebar-navigation";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { cn } from "@/renderer/lib/utils";

interface UserSidebarProps {
  className?: string;
}

export function UserSidebar({ className }: UserSidebarProps) {
  return (
    <aside
      className={cn(
        "h-full flex flex-col",
        "bg-sidebar/95 backdrop-blur-md",
        "border-r border-sidebar-border/60",
        "shadow-lg/20",
        "transition-all duration-300 ease-in-out",
        className,
      )}
      role="complementary"
      aria-label="User area navigation"
    >
      <div className="flex-shrink-0">
        <SidebarHeader />
      </div>

      <ScrollArea className="flex-1 overflow-hidden" type="auto">
        <SidebarNavigation />
      </ScrollArea>

      <div
        className={cn(
          "flex-shrink-0",
          "border-t border-sidebar-border/40",
          "bg-sidebar-accent/20",
        )}
      >
        <SidebarUserArea />
      </div>
    </aside>
  );
}
