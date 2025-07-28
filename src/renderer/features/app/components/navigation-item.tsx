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
        "w-full justify-start px-[var(--spacing-component-md)] transition-all duration-200 ease-in-out rounded-lg border border-transparent group",
        "hover:bg-sidebar-accent/60 hover:border-sidebar-border/30 hover:text-sidebar-accent-foreground hover:scale-[1.01] hover:shadow-sm",
        "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
        "active:scale-[0.98] active:bg-sidebar-accent/80",
        className,
      )}
      style={{
        height:
          "calc(var(--spacing-component-xl) + var(--spacing-component-sm))",
        fontSize: "var(--font-size-sm)",
        fontWeight: "var(--font-weight-medium)",
        color: "hsl(var(--sidebar-foreground) / 0.8)",
      }}
      activeProps={{
        className: cn(
          "bg-sidebar-accent/90 text-sidebar-accent-foreground border-sidebar-border/50 shadow-md scale-[1.02]",
          "font-semibold",
          className,
        ),
        style: {
          fontWeight: "var(--font-weight-semibold)",
          backgroundColor: "hsl(var(--sidebar-accent) / 0.9)",
          color: "hsl(var(--sidebar-accent-foreground))",
        },
      }}
      activeOptions={activeOptions}
      {...restLinkProps}
    >
      {children || (
        <>
          {IconComponent && (
            <IconComponent
              className="flex-shrink-0 transition-transform duration-200 group-hover:scale-[1.01]"
              style={{
                width: "var(--spacing-component-lg)",
                height: "var(--spacing-component-lg)",
                marginRight: "var(--spacing-component-md)",
              }}
            />
          )}
          {label && (
            <span
              className="truncate transition-colors duration-200"
              style={{
                fontSize: "var(--font-size-sm)",
                lineHeight: "var(--line-height-normal)",
              }}
            >
              {label}
            </span>
          )}
        </>
      )}
    </CustomLink>
  );
}
