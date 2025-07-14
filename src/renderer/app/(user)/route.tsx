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
import { usePageTitle } from "@/renderer/contexts/page-title-context";

function UserLayout() {
  const location = useLocation();
  const { title: pageTitle, icon: pageIcon } = usePageTitle();

  // Get page title based on current route - use PageTitle context if available
  const getPageTitle = () => {
    // If PageTitle is set by child components, use it
    if (pageTitle) return pageTitle;

    const path = location.pathname;
    if (path === "/") return "Dashboard";
    if (path.includes("/settings")) return "Configurações";
    if (path.includes("/conversation/")) return "Conversa";
    if (path.includes("/ai-chat-test")) return "AI Chat Test";
    return "Usuário";
  };

  const getPageSubtitle = () => {
    // Don't show subtitle for conversations since we have the persona name as title
    if (pageTitle && location.pathname.includes("/conversation/"))
      return undefined;

    const path = location.pathname;
    if (path === "/") return "Visão geral e estatísticas";
    if (path.includes("/settings")) return "Configurações do usuário e sistema";
    if (path.includes("/conversation/")) return "Mensagem direta";
    if (path.includes("/ai-chat-test"))
      return "Teste de integração AI Chat para canais";
    return undefined;
  };

  const getPageIcon = () => {
    // If PageTitle has an icon, use it
    if (pageIcon) return pageIcon;
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
              icon={getPageIcon()}
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
