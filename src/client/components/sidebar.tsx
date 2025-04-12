import { SystemLabel } from "@/components/messages/common";
import { SidebarLink } from "./sidebar-link";
import { ModelStatus } from "./model-status";
import { sidebarNavItems } from "../lib/sidebar-items";
import { useRouter } from "@tanstack/react-router";
import { useLingui } from "@lingui/react";
import { DashboardIcon } from "./icons/dashboard-icon";
import { DocumentationIcon } from "./icons/documentation-icon";
import { ActivityLogIcon } from "./icons/activity-log-icon";
import { RepositoriesIcon } from "./icons/repositories-icon";
import { ModelsIcon } from "./icons/models-icon";
import { SettingsIcon } from "./icons/settings-icon";

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <DashboardIcon />,
  documentation: <DocumentationIcon />,
  "activity-log": <ActivityLogIcon />,
  repositories: <RepositoriesIcon />,
  models: <ModelsIcon />,
  settings: <SettingsIcon />,
};

export function Sidebar() {
  const router = useRouter();
  const currentPath = router.state.location.pathname;
  const { i18n } = useLingui();

  return (
    <div className="w-64 border-r bg-card p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-6">
        <SystemLabel />
      </h1>
      <nav className="space-y-1">
        {sidebarNavItems.map((item) => (
          <SidebarLink
            key={item.to}
            to={item.to}
            label={i18n._(item.labelKey)}
            icon={iconMap[item.iconId]}
            active={currentPath === item.to}
          />
        ))}
      </nav>
      <div className="mt-auto">
        <ModelStatus
          modelName="N/A"
          memoryUsagePercent={0}
          memoryUsed="0"
          memoryTotal="0"
        />
      </div>
    </div>
  );
}