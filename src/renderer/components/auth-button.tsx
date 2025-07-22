import { LogOut, User } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/renderer/components/ui/button";
import { useAuth } from "@/renderer/contexts/auth.context";

export function AuthButton() {
  const { user, isAuthenticated, isLoading, error, logout, clearError } =
    useAuth();

  // Clear any existing errors when component mounts
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  const handleAuth = async () => {
    try {
      if (isAuthenticated) {
        await logout();
      }
      // Remove quickLogin since we don't have demo login anymore
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isAuthenticated && user && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{user.name}</span>
        </div>
      )}

      {isAuthenticated && (
        <Button
          onClick={handleAuth}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {isLoading ? (
            <>Loading...</>
          ) : (
            <>
              <LogOut className="h-4 w-4" />
              Logout
            </>
          )}
        </Button>
      )}

      {error && <div className="text-sm text-red-500">{error}</div>}
    </div>
  );
}
