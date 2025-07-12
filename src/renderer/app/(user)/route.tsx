import {
  createFileRoute,
  Outlet,
  useNavigate,
  useLocation,
} from "@tanstack/react-router";
import { TopBar } from "@/renderer/components/layout/top-bar";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/renderer/components/ui/resizable";
import { mockAgents } from "@/renderer/lib/placeholders";
import { UserSidebar } from "@/features/user-management/components/user-sidebar";

function UserLayout() {
  const location = useLocation();

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/") return "Dashboard";
    if (path.includes("/settings")) return "Configurações";
    if (path.includes("/conversation/")) return "Conversa";
    return "Usuário";
  };

  const getPageSubtitle = () => {
    const path = location.pathname;
    if (path === "/") return "Visão geral e estatísticas";
    if (path.includes("/settings")) return "Configurações do usuário e sistema";
    if (path.includes("/conversation/")) return "Mensagem direta";
    return undefined;
  };

  return (
    <div className="flex h-full">
      <ResizablePanelGroup direction="horizontal">
        {/* User Sidebar - Resizable */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <UserSidebar />
        </ResizablePanel>

        <ResizableHandle />

        {/* Main area with TopBar and content */}
        <ResizablePanel defaultSize={75}>
          <div className="flex flex-col h-full overflow-hidden">
            {/* Top Bar - No agents sidebar on user routes */}
            <TopBar
              title={getPageTitle()}
              subtitle={getPageSubtitle()}
              type="page"
            />

            {/* Content area */}
            <div className="flex-1 overflow-auto">
              <Outlet />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export const Route = createFileRoute("/(user)")({
  component: UserLayout,
});
