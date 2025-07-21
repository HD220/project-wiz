import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/renderer/store/auth-store";

function HomePage() {
  return (
    <div className="min-h-screen bg-[#36393f] flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold mb-2">Project Wiz</h1>
        <p className="text-[#b9bbbe]">Redirecting...</p>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/")({
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
    
    // If authenticated, redirect to user area  
    throw redirect({ to: "/user" });
  },
  component: HomePage,
});
