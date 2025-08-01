import { LogOut, User } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import { useAuth } from "@/renderer/contexts/auth.context";
import { getRendererLogger } from "@/shared/logger/renderer";

const logger = getRendererLogger("auth-button");

export function AuthButton() {
  const { user, isAuthenticated, logout } = useAuth();

  const handleAuth = async () => {
    try {
      if (isAuthenticated) {
        await logout();
      }
    } catch (error) {
      logger.error("Auth error:", error);
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
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      )}
    </div>
  );
}
