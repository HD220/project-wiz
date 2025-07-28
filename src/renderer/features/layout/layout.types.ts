/**
 * Layout component types
 * Pure presentation types for layout components
 */

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface ContentHeaderProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  customIcon?: ReactNode;
  showMembersToggle?: boolean;
  isMemberSidebarCollapsed?: boolean;
  onToggleMemberSidebar?: () => void;
}

export interface NavigationItemProps {
  icon?: LucideIcon;
  label?: string;
  className?: string;
  children?: ReactNode;
  // Extends TanStack Router LinkProps
  to: string;
  search?: Record<string, any>;
  params?: Record<string, any>;
}

export interface SidebarHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
}

export interface SidebarNavigationProps {
  children: ReactNode;
  className?: string;
}
