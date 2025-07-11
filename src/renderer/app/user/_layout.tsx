import { useEffect } from "react";
import { Outlet, useNavigate, createFileRoute } from "@tanstack/react-router";
import { UserSidebar } from "@/renderer/components/layout/user-sidebar";
import { useSidebar } from "@/renderer/contexts/sidebar-context";
import { mockAgents } from "@/renderer/lib/placeholders"; // For placeholder data
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/renderer/components/ui/resizable";

export function UserLayout() {
  const { setMode } = useSidebar();
  const navigate = useNavigate();

  useEffect(() => {
    setMode("user");
  }, [setMode]);

  const handleAgentDMSelect = (agentId: string) => {
    // Placeholder navigation, actual route might differ
    console.log("Navigate to DM with agent:", agentId);
    // navigate({ to: '/user/dm/$agentId', params: { agentId } });
  };

  const handleSettings = () => {
    navigate({ to: "/user/settings/" }); // Added trailing slash for consistency
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
        <UserSidebar
          agents={mockAgents} // Using mock data for now
          onAgentDMSelect={handleAgentDMSelect}
          onSettings={handleSettings}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75} minSize={60}>
        <div className="p-4"> {/* Added padding for content visibility */}
          <Outlet />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export const Route = createFileRoute('/user/_layout')({
  component: UserLayout,
});
