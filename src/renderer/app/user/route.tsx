import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { UserSidebar } from "@/renderer/components/layout/user-sidebar";
import { mockAgents } from "@/renderer/lib/placeholders";

function UserLayout() {
  const navigate = useNavigate();
  
  console.log("UserLayout rendering");

  const handleAgentDMSelect = (agentId: string) => {
    console.log("Navigate to DM with agent:", agentId);
    // navigate({ to: '/user/dm/$agentId', params: { agentId } });
  };

  const handleSettings = () => {
    navigate({ to: "/user/settings/" });
  };

  return (
    <div className="flex h-full">
      <div className="w-64 flex-none">
        <UserSidebar
          agents={mockAgents}
          onAgentDMSelect={handleAgentDMSelect}
          onSettings={handleSettings}
        />
      </div>
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

export const Route = createFileRoute('/user')({
  component: UserLayout,
})