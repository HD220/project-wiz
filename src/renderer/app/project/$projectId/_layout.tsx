import { useEffect, useState } from "react";
import { Outlet, useNavigate, createFileRoute } from "@tanstack/react-router";
import { ChannelsSidebar } from "@/renderer/components/layout/channels-sidebar";
import { useSidebar } from "@/renderer/contexts/sidebar-context";
import {
  mockProjects, // Using mock data for now
  getChannelsByProject,
  getAgentsByProject,
  // Project, // Type unused in provided code
  // Channel, // Type unused in provided code
  // Agent // Type unused in provided code
} from "@/renderer/lib/placeholders";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/renderer/components/ui/resizable";
// Assuming CreateChannelModal is still in __root.tsx and managed globally or via context later
// For now, onAddChannel will be a console log.

// Define the route for this layout
export const Route = createFileRoute('/project/$projectId/_layout')({
  component: ProjectLayout,
  // loader: async ({ params }) => { ... } // Future: load project data here
});

export function ProjectLayout() {
  const { projectId } = Route.useParams();
  const { setMode } = useSidebar();
  const navigate = useNavigate(); // Added navigate import based on plan

  // const [showCreateChannelModal, setShowCreateChannelModal] = useState(false); // If modal is local

  useEffect(() => {
    setMode("server");
  }, [setMode]);

  // Mock data fetching logic (replace with actual data fetching later)
  const currentProject = mockProjects.find(p => p.id === projectId);
  const channels = getChannelsByProject(projectId);
  const agents = getAgentsByProject(projectId);
  // Initialize selectedChannelId with the first channel's ID if channels exist, otherwise undefined.
  const [selectedChannelId, setSelectedChannelId] = useState<string | undefined>(channels[0]?.id);


  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelId(channelId);
    // Example: navigate to a specific channel route
    // navigate({ to: '/project/$projectId/channel/$channelId', params: { projectId, channelId } });
    // For now, let's navigate to the chat page for this project, assuming it's the index for a channel
    navigate({ to: '/project/$projectId/chat/', params: { projectId } });
    console.log(`Project ${projectId}: Select channel ${channelId}`);
  };

  const handleAgentDMSelect = (agentId: string) => {
    // Example: navigate to a DM route with an agent
    // navigate({ to: '/project/$projectId/dm/$agentId', params: { projectId, agentId } });
    // For now, let's navigate to the chat page for this project, assuming it's the index for a DM
    navigate({ to: '/project/$projectId/chat/', params: { projectId } });
    console.log(`Project ${projectId}: Select DM with agent ${agentId}`);
  };

  const handleAddChannel = () => {
    // setShowCreateChannelModal(true); // If modal is managed locally
    // For now, assume modal is global or log
    console.log(`Project ${projectId}: Add channel clicked`);
    // Potentially use a context to open the modal defined in __root.tsx
  };

  if (!currentProject) {
    return <div>Projeto não encontrado.</div>;
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
        <ChannelsSidebar
          projectName={currentProject.name}
          channels={channels}
          agents={agents}
          selectedChannelId={selectedChannelId}
          onChannelSelect={handleChannelSelect}
          onAgentDMSelect={handleAgentDMSelect}
          onAddChannel={handleAddChannel}
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
