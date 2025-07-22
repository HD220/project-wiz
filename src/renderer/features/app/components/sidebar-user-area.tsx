import { useRouter } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import { useAuth } from "@/renderer/contexts/auth.context";
import { UserAvatar } from "@/renderer/features/user/components/user-avatar";
import { UserStatus } from "@/renderer/features/user/components/user-status";

function SidebarUserArea() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.navigate({ to: "/auth/login", replace: true });
  };

  return (
    <div className="p-2 bg-muted/50">
      <div className="flex items-center gap-2">
        <UserAvatar name={user?.name} />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {user?.name || "User"}
          </p>
          <UserStatus status="online" />
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground hover:bg-destructive hover:text-destructive-foreground p-1"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export { SidebarUserArea };
