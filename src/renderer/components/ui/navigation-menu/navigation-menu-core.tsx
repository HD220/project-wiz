import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import * as React from "react";
import { cn } from "@/lib/utils";
import { NavigationMenuViewport } from "./navigation-menu-viewport";

export function NavigationMenu(
  props: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
    viewport?: boolean;
  },
) {
  const { className, children, viewport = true, ...rest } = props;

  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...rest}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

export function NavigationMenuList(
  props: React.ComponentProps<typeof NavigationMenuPrimitive.List>,
) {
  const { className, ...rest } = props;

  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1",
        className,
      )}
      {...rest}
    />
  );
}

export function NavigationMenuItem(
  props: React.ComponentProps<typeof NavigationMenuPrimitive.Item>,
) {
  const { className, ...rest } = props;

  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...rest}
    />
  );
}
