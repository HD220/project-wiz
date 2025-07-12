import { createFileRoute, Outlet, useNavigate, useLocation } from '@tanstack/react-router'
import { useState } from "react";
import { UserSidebar } from "@/renderer/components/layout/user-sidebar";
import { AgentsSidebar } from "@/renderer/components/layout/agents-sidebar";
import { TopBar } from "@/renderer/components/layout/top-bar";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/renderer/components/ui/resizable";
import { mockAgents } from "@/renderer/lib/placeholders";

function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [agentsSidebarOpen, setAgentsSidebarOpen] = useState(false);
  

  const handleAgentDMSelect = (agentId: string) => {
    console.log("Navigate to DM with agent:", agentId);
    // navigate({ to: '/user/dm/$agentId', params: { agentId } });
  };

  const handleSettings = () => {
    navigate({ to: "/user/settings/" });
  };

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/user/") return "Dashboard";
    if (path.includes("/user/settings")) return "Configurações";
    return "Usuário";
  };

  const getPageSubtitle = () => {
    const path = location.pathname;
    if (path === "/user/") return "Visão geral e estatísticas";
    if (path.includes("/user/settings")) return "Configurações do usuário e sistema";
    return undefined;
  };

  return (
    <div className="flex h-full">
      <ResizablePanelGroup direction="horizontal">
        {/* User Sidebar - Resizable */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <UserSidebar
            agents={mockAgents}
            onAgentDMSelect={handleAgentDMSelect}
            onSettings={handleSettings}
          />
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

export const Route = createFileRoute('/user')({
  component: UserLayout,
})