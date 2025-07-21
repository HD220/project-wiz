import { LinkProps } from "@tanstack/react-router";
import { LucideIcon } from "lucide-react";
import { forwardRef } from "react";

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

const NavigationItem = forwardRef<HTMLAnchorElement, NavigationItemProps>(
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
      ...restLinkProps
    } = props;

    return (
      <CustomLink
        ref={ref}
        to={to}
        variant={variant}
        size={size}
        className={cn(
          "w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent",
          className,
        )}
        activeProps={{
          className: cn("bg-accent text-foreground", className),
        }}
        activeOptions={activeOptions}
        {...restLinkProps}
      >
        {children || (
          <>
            {IconComponent && <IconComponent className="w-4 h-4 mr-2" />}
            {label}
          </>
        )}
      </CustomLink>
    );
  },
);

NavigationItem.displayName = "NavigationItem";

export { NavigationItem };
