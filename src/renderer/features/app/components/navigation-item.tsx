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
        "w-full justify-start h-10 px-4 text-sm font-normal transition-all duration-200 rounded-lg",
        "text-muted-foreground hover:text-foreground hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      activeProps={{
        className: cn(
          "bg-accent text-foreground font-medium shadow-sm",
          className,
        ),
      }}
      activeOptions={activeOptions}
      {...restLinkProps}
    >
      {children || (
        <>
          {IconComponent && (
            <IconComponent className="w-4 h-4 mr-4 flex-shrink-0" />
          )}
          {label && <span className="truncate">{label}</span>}
        </>
      )}
    </CustomLink>
  );
}
