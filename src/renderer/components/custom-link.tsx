import { forwardRef } from "react";
import { Link, LinkProps } from "@tanstack/react-router";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CustomLinkProps extends Omit<LinkProps, "className"> {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
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
  }
);

CustomLink.displayName = "CustomLink";