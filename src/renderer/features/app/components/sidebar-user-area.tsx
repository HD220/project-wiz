import { useRouter } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import { useAuth } from "@/renderer/contexts/auth.context";
import { UserAvatar } from "@/renderer/features/user/components/user-avatar";
import { UserStatus } from "@/renderer/features/user/components/user-status";

export function SidebarUserArea() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.navigate({ to: "/auth/login", replace: true });
  };

  return (
    <footer className="p-3 bg-muted/30 backdrop-blur-sm border-t border-border/50">
      <div className="flex items-center gap-3 group">
        <UserAvatar name={user?.name} />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {user?.name || "User"}
          </p>
          <UserStatus status="online" />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 focus-visible:ring-2 focus-visible:ring-destructive opacity-0 group-hover:opacity-100"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </footer>
  );
}
