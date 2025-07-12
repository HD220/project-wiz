import { Outlet, useNavigate, createFileRoute } from "@tanstack/react-router";
import { UserSidebar } from "@/renderer/components/layout/user-sidebar";
// useSidebar import removed
import { mockAgents } from "@/renderer/lib/placeholders";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/renderer/components/ui/resizable";

export function UserLayout() {
  // useSidebar hook call removed
  const navigate = useNavigate();

  // useEffect hook that calls setMode removed

  const handleAgentDMSelect = (agentId: string) => {
    console.log("Navigate to DM with agent:", agentId);
    // navigate({ to: '/user/dm/$agentId', params: { agentId } });
  };

  const handleSettings = () => {
    navigate({ to: "/user/settings/" });
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
        <UserSidebar
          agents={mockAgents}
          onAgentDMSelect={handleAgentDMSelect}
          onSettings={handleSettings}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75} minSize={60}>
        <div className="p-4">
          <Outlet />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export const Route = createFileRoute('/user/_layout')({
  component: UserLayout,
});
