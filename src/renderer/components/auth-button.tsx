import { LogIn, LogOut, User } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/renderer/components/ui/button";
import { useAuthStore } from "@/renderer/store/auth.store";

export function AuthButton() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    quickLogin,
    logout,
    clearError,
  } = useAuthStore();

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
      } else {
        await quickLogin();
      }
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

      <Button
        onClick={handleAuth}
        disabled={isLoading}
        variant={isAuthenticated ? "outline" : "default"}
        size="sm"
        className="gap-2"
      >
        {isLoading ? (
          <>Loading...</>
        ) : isAuthenticated ? (
          <>
            <LogOut className="h-4 w-4" />
            Logout
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            Quick Login (Demo)
          </>
        )}
      </Button>

      {error && <div className="text-sm text-red-500">{error}</div>}
    </div>
  );
}
