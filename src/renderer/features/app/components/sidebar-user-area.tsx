import { useRouter } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

import { useAuthStore } from "@/renderer/store/auth-store";

import { Button } from "@/components/ui/button";

import { UserAvatar } from "./user-avatar";
import { UserStatus } from "./user-status";

export function SidebarUserArea() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

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
