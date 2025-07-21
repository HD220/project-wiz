import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/renderer/store/auth-store";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { WelcomeView } from "@/features/dashboard/components/welcome-view";

function DashboardPage() {
  return (
    <DashboardLayout>
      <WelcomeView />
    </DashboardLayout>
  );
}

export const Route = createFileRoute("/dashboard")({
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
  component: DashboardPage,
});