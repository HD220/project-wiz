import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/renderer/store/auth-store";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ServerView } from "@/features/dashboard/components/server-view";

function ServerPage() {
  const { serverId } = Route.useParams();
  
  return (
    <DashboardLayout>
      <ServerView serverId={serverId} />
    </DashboardLayout>
  );
}

export const Route = createFileRoute("/dashboard/server/$serverId")({
  beforeLoad: async () => {
    const { isAuthenticated, getCurrentUser } = useAuthStore.getState();
    
    // Try to get current user if not already authenticated
    if (!isAuthenticated) {
      await getCurrentUser();
      
      // Check again after trying to get current user
      const { isAuthenticated: stillAuthenticated } = useAuthStore.getState();
      if (!stillAuthenticated) {
        throw redirect({ to: "/auth/login" });
      }
    }
  },
  component: ServerPage,
});