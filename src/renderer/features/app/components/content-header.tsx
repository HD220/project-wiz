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
    <header className="h-12 bg-background border-b flex items-center px-4 justify-between">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <IconComponent className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-foreground font-semibold">{title}</h1>
        </div>

        <Separator orientation="vertical" className="mx-4 h-6" />

        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Members Toggle */}
      {showMembersToggle && onToggleMemberSidebar && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "w-8 h-8",
            !isMemberSidebarCollapsed && "bg-accent text-accent-foreground",
          )}
          onClick={onToggleMemberSidebar}
        >
          <Users className="w-4 h-4" />
        </Button>
      )}
    </header>
  );
}

export { ContentHeader };
