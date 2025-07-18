import * as React from "react";
import { useSidebar } from "./sidebar-context";
import {
  NonCollapsibleSidebar,
  MobileSidebar,
  DesktopSidebar,
} from "./sidebar-variants";

interface SidebarProps extends React.ComponentProps<"div"> {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}

export function Sidebar(props: SidebarProps) {
  const {
    side = "left",
    variant = "sidebar",
    collapsible = "offcanvas",
    className,
    children,
    ...rest
  } = props;
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === "none") {
    return (
      <NonCollapsibleSidebar className={className} {...rest}>
        {children}
      </NonCollapsibleSidebar>
    );
  }

  if (isMobile) {
    return (
      <MobileSidebar
        side={side}
        openMobile={openMobile}
        setOpenMobile={setOpenMobile}
        {...rest}
      >
        {children}
      </MobileSidebar>
    );
  }

  return (
    <DesktopSidebar
      side={side}
      variant={variant}
      state={state}
      collapsible={collapsible}
      className={className}
      {...rest}
    >
      {children}
    </DesktopSidebar>
  );
}
