import { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavigationItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function NavigationItem({
  icon: IconComponent,
  label,
  isActive = false,
  onClick,
  className,
}: NavigationItemProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent",
        isActive && "bg-accent text-foreground",
        className,
      )}
    >
      <IconComponent className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
}
