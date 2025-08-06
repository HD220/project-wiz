import { forwardRef } from "react";
import { Link, LinkProps } from "@tanstack/react-router";
import { LucideIcon } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/renderer/components/ui/tooltip";
import { cn } from "@/renderer/lib/utils";

// Sidebar Icon Button with Tooltip - Used in RootSidebar
interface SidebarIconButtonProps extends Omit<LinkProps, "className"> {
  icon?: LucideIcon;
  avatar?: React.ReactNode;
  tooltipText: string;
  className?: string;
  isActive?: boolean;
  showActiveIndicator?: boolean;
}

const SidebarIconButton = forwardRef<HTMLAnchorElement, SidebarIconButtonProps>(
  (props, ref) => {
    const {
      icon: IconComponent,
      avatar,
      tooltipText,
      className,
      isActive,
      showActiveIndicator = true,
      to,
      activeOptions,
      ...restLinkProps
    } = props;

    const buttonContent = (
      <Button
        asChild
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn(
          "w-10 h-10 lg:w-12 lg:h-12", // Responsive button size
          "p-0 rounded-2xl border-2 transition-all duration-200 ease-out group relative cursor-pointer",
          "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
          "hover:scale-[1.01] hover:shadow-lg hover:shadow-sidebar-primary/20",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground border-sidebar-primary rounded-[14px] shadow-md shadow-sidebar-primary/25 scale-105"
            : "bg-sidebar-accent/60 border-transparent hover:bg-sidebar-primary hover:text-sidebar-primary-foreground hover:rounded-[14px] hover:border-sidebar-primary/50",
          className,
        )}
        {...restLinkProps}
      >
        <Link
          to={to}
          activeOptions={activeOptions}
          className="flex items-center justify-center w-full h-full"
        >
          {avatar ||
            (IconComponent && (
              <IconComponent className="w-4 h-4 lg:w-5 lg:h-5 transition-transform duration-200 group-hover:scale-[1.01]" />
            ))}
          {showActiveIndicator && isActive && (
            <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary-foreground rounded-full z-10" />
          )}
        </Link>
      </Button>
    );

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={16}
            className="bg-sidebar-foreground text-sidebar text-sm font-medium shadow-lg border border-sidebar-border/50"
          >
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);

SidebarIconButton.displayName = "SidebarIconButton";

export { SidebarIconButton };
export type { SidebarIconButtonProps };
