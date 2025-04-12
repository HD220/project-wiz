import { SystemLabel } from "@/components/messages/common";
import { SidebarLink } from "./sidebar-link";
import { ModelStatus } from "./model-status";
import { sidebarNavItems } from "../lib/sidebar-items";
import { useRouter } from "@tanstack/react-router";

export function Sidebar() {
  const router = useRouter();
  const currentPath = router.state.location.pathname;

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
            label={item.label()}
            icon={item.icon}
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