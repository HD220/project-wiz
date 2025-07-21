import { Link, LinkProps } from "@tanstack/react-router";
import { forwardRef } from "react";

import { Button, buttonVariants } from "@/renderer/components/ui/button";

import type { VariantProps } from "class-variance-authority";

interface CustomLinkProps
  extends Omit<LinkProps, "className">,
    VariantProps<typeof buttonVariants> {
  className?: string;
  children: React.ReactNode;
}

const CustomLink = forwardRef<HTMLAnchorElement, CustomLinkProps>(
  (props, ref) => {
    const {
      variant = "ghost",
      size,
      className,
      children,
      to,
      ...restLinkProps
    } = props;

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

export { CustomLink };
