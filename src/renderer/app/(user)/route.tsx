import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

import { TopBar } from "@/renderer/components/layout/top-bar";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/renderer/components/ui/resizable";
import { usePageTitle } from "@/renderer/contexts/page-title-context";
import { UserSidebar } from "@/renderer/domains/users/components";

function getPageTitle(
  pageTitle: string | undefined,
  location: { pathname: string },
) {
  if (pageTitle) {
    return pageTitle;
  }

  const path = location.pathname;
  if (path === "/") return "Dashboard";
  if (path.includes("/settings")) return "Configurações";
  if (path.includes("/conversation/")) return "Conversa";
  if (path.includes("/ai-chat-test")) return "AI Chat Test";
  return "Usuário";
}

function getPageSubtitle(
  pageTitle: string | undefined,
  location: { pathname: string },
) {
  if (pageTitle && location.pathname.includes("/conversation/")) {
    return undefined;
  }

  const path = location.pathname;
  if (path === "/") return "Visão geral e estatísticas";
  if (path.includes("/settings")) return "Configurações do usuário e sistema";
  if (path.includes("/conversation/")) return "Mensagem direta";
  if (path.includes("/ai-chat-test"))
    return "Teste de integração AI Chat para canais";
  return undefined;
}

function getPageIcon(pageIcon: string | undefined): React.ReactNode {
  if (pageIcon) {
    return pageIcon;
  }
  return undefined;
}

function UserLayout() {
  const location = useLocation();
  const { title: pageTitle, icon: pageIcon } = usePageTitle();

  return (
    <div className="flex h-full">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <UserSidebar />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={75}>
          <div className="flex flex-col h-full overflow-hidden">
            <TopBar
              title={getPageTitle(pageTitle, location)}
              subtitle={getPageSubtitle(pageTitle, location)}
              type="page"
              icon={getPageIcon(pageIcon)}
            />

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
