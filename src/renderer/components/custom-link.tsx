import { Link, LinkProps } from "@tanstack/react-router";
import { forwardRef } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { VariantProps } from "class-variance-authority";

interface CustomLinkProps
  extends Omit<LinkProps, "className">,
    VariantProps<typeof buttonVariants> {
  className?: string;
  children: React.ReactNode;
}

export const CustomLink = forwardRef<HTMLAnchorElement, CustomLinkProps>(
  ({ variant = "ghost", size, className, children, ...linkProps }, ref) => {
    return (
      <Button variant={variant} size={size} className={className} asChild>
        <Link ref={ref} {...linkProps}>
          {children}
        </Link>
      </Button>
    );
  },
);

CustomLink.displayName = "CustomLink";
