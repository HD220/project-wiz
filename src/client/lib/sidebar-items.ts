import { SidebarNavItemData } from "../types/sidebar-nav-item";

/**
 * Each item in the sidebarNavItems array represents a navigation entry for the sidebar.
 * The 'labelKey' property is an i18n key used to resolve the display label for each sidebar item,
 * enabling internationalization and consistent label management across the application.
 */
const sidebarNavItems: SidebarNavItemData[] = [
  {
    to: "/",
    labelKey: "sidebar.dashboard",
    iconId: "dashboard",
  },
  {
    to: "/documentation",
    labelKey: "sidebar.documentation",
    iconId: "documentation",
  },
  {
    to: "/activity-log",
    labelKey: "sidebar.activityLog",
    iconId: "activity-log",
  },
  {
    to: "/repositories",
    labelKey: "sidebar.repositories",
    iconId: "repositories",
  },
  {
    to: "/models",
    labelKey: "sidebar.models",
    iconId: "models",
  },
  {
    to: "/settings",
    labelKey: "sidebar.settings",
    iconId: "settings",
  },
];

/**
 * Returns the sidebar navigation items.
 * This factory function improves testability and allows for future extension/mocking.
 */
export function getSidebarNavItems(): SidebarNavItemData[] {
  return sidebarNavItems;
}