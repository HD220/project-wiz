import { LinkProps } from "@tanstack/react-router";
import { LucideIcon } from "lucide-react";

import { CustomLink } from "@/renderer/components/custom-link";
import { buttonVariants } from "@/renderer/components/ui/button";
import { cn } from "@/renderer/lib/utils";

import type { VariantProps } from "class-variance-authority";

interface NavigationItemProps
  extends Omit<LinkProps, "className">,
    VariantProps<typeof buttonVariants> {
  icon?: LucideIcon;
  label?: string;
  className?: string;
  children?: React.ReactNode;
}

export function NavigationItem(props: NavigationItemProps) {
  const {
    icon: IconComponent,
    label,
    children,
    variant = "ghost",
    size,
    className,
    to,
    activeOptions,
    ...restLinkProps
  } = props;

  return (
    <CustomLink
      to={to}
      variant={variant}
      size={size}
      className={cn(
        "w-full justify-start px-2 h-8 text-sm font-medium transition-all duration-150 rounded border border-transparent group",
        "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
        "focus-visible:ring-1 focus-visible:ring-sidebar-ring",
        "text-sidebar-foreground/80",
        className,
      )}
      activeProps={{
        className: cn(
          "bg-sidebar-accent/90 text-sidebar-accent-foreground font-semibold",
          className,
        ),
      }}
      activeOptions={activeOptions}
      {...restLinkProps}
    >
      {children || (
        <>
          {IconComponent && (
            <IconComponent className="flex-shrink-0 w-4 h-4 mr-3" />
          )}
          {label && <span className="truncate text-sm">{label}</span>}
        </>
      )}
    </CustomLink>
  );
}
