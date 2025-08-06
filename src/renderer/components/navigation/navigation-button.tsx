import { forwardRef } from "react";
import { LinkProps } from "@tanstack/react-router";
import { LucideIcon } from "lucide-react";

import { Button } from "@/renderer/components/atoms/button";
import { cn } from "@/renderer/lib/utils";

import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/renderer/components/atoms/button";

// Base NavigationButton Component
interface NavigationButtonProps
  extends Omit<LinkProps, "className">,
    VariantProps<typeof buttonVariants> {
  icon?: LucideIcon;
  label?: string;
  className?: string;
  children?: React.ReactNode;
  "aria-label"?: string;
  navigationVariant?: "default" | "sidebar";
  role?: string;
}

const NavigationButton = forwardRef<HTMLAnchorElement, NavigationButtonProps>(
  (props, ref) => {
    const {
      icon: IconComponent,
      label,
      children,
      variant = "ghost",
      size,
      className,
      to,
      activeOptions,
      navigationVariant = "default",
      role,
      ...restLinkProps
    } = props;

    const isSidebar = navigationVariant === "sidebar";

    return (
      <Button
        asChild
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "w-full justify-start text-sm font-medium transition-all duration-150 rounded border border-transparent group",
          isSidebar ? "h-8 px-[var(--spacing-component-sm)]" : "h-9",
          isSidebar
            ? "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground focus-visible:ring-1 focus-visible:ring-sidebar-ring"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        {...restLinkProps}
      >
        <Link
          to={to}
          activeOptions={activeOptions}
          role={role}
          className={cn("flex items-center w-full h-full")}
        >
          {children || (
            <>
              {IconComponent && (
                <IconComponent
                  className={cn(
                    "transition-colors flex-shrink-0",
                    isSidebar
                      ? "w-4 h-4 mr-[var(--spacing-component-md)]"
                      : "w-4 h-4 mr-3",
                  )}
                />
              )}
              {label && <span className="truncate text-sm">{label}</span>}
            </>
          )}
        </Link>
      </Button>
    );
  },
);

NavigationButton.displayName = "NavigationButton";

export { NavigationButton };
export type { NavigationButtonProps };
