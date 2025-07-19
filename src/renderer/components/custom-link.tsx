import { Link, LinkProps } from "@tanstack/react-router";
import { forwardRef } from "react";

import { Button, buttonVariants } from "@/components/ui/button";

import type { VariantProps } from "class-variance-authority";

interface CustomLinkProps
  extends Omit<LinkProps, "className" | "to">,
    VariantProps<typeof buttonVariants> {
  className?: string;
  children: React.ReactNode;
  to: LinkProps["to"];
}

export const CustomLink = forwardRef<HTMLAnchorElement, CustomLinkProps>(
  (
    { variant = "ghost", size, className, children, to, ...restLinkProps },
    ref,
  ) => {
    return (
      <Button variant={variant} size={size} className={className} asChild>
        <Link ref={ref} to={to} {...restLinkProps}>
          {children}
        </Link>
      </Button>
    );
  },
);

CustomLink.displayName = "CustomLink";
