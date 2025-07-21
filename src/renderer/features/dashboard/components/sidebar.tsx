import { Hash, Users, Settings, LogOut } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { useAuthStore } from "@/renderer/store/auth-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NavigationItem } from "./navigation-item";
import { UserAvatar } from "./user-avatar";
import { UserStatus } from "./user-status";

export function Sidebar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.navigate({ to: "/auth/login", replace: true });
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Server/App header */}
      <div className="h-12 bg-card border-b flex items-center justify-center">
        <h1 className="text-foreground font-semibold">Project Wiz</h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-2 space-y-1">
        <NavigationItem icon={Hash} label="general" isActive />
        <NavigationItem icon={Users} label="team" />
        
        <Separator className="my-2" />
        
        <NavigationItem icon={Settings} label="Settings" />
      </div>

      {/* User area */}
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
    </div>
  );
}