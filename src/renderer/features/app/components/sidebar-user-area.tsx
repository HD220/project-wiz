import { useRouter } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import { useAuth } from "@/renderer/contexts/auth.context";
import {
  ProfileAvatar,
  ProfileAvatarImage,
  ProfileAvatarStatus,
} from "@/renderer/components/ui/profile-avatar";
import { UserStatus } from "@/renderer/features/user/components/user-status";

export function SidebarUserArea() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.navigate({ to: "/auth/login", replace: true });
  };

  return (
    <footer className="relative bg-sidebar/95 backdrop-blur-md border-t border-sidebar-border/60 shadow-sm p-[var(--spacing-component-md)]">
      {/* Background gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-sidebar via-sidebar/98 to-sidebar/95 pointer-events-none" />

      {/* User area content with enhanced styling */}
      <div className="relative z-10 flex items-center gap-[var(--spacing-component-md)] group transition-all duration-200 ease-in-out hover:bg-sidebar-accent/20 rounded-lg p-[var(--spacing-component-sm)] -m-[var(--spacing-component-sm)]">
        <div className="flex-shrink-0">
          {user && (
            <ProfileAvatar size="md">
              <ProfileAvatarImage
                user={{
                  id: user.id,
                  name: user.name,
                  username: user.username,
                  email: user.email,
                  avatar: user.avatar,
                  theme: user.theme,
                  createdAt: user.createdAt,
                  updatedAt: user.updatedAt,
                }}
                size="md"
              />
              <ProfileAvatarStatus
                user={{
                  id: user.id,
                  name: user.name,
                  username: user.username,
                  email: user.email,
                  avatar: user.avatar,
                  theme: user.theme,
                  createdAt: user.createdAt,
                  updatedAt: user.updatedAt,
                }}
                size="md"
              />
            </ProfileAvatar>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-[var(--spacing-component-xs)]">
          <p className="truncate transition-colors duration-200 font-semibold text-sm text-sidebar-foreground">
            {user?.name || "User"}
          </p>
          <UserStatus status="online" size="sm" showLabel={true} />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="w-8 h-8 rounded-md border border-transparent text-sidebar-foreground/60 hover:text-destructive-foreground hover:bg-destructive hover:border-destructive/50 hover:scale-[1.01] hover:shadow-md transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar opacity-0 group-hover:opacity-100 active:scale-95"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4 transition-transform duration-200" />
        </Button>
      </div>
    </footer>
  );
}
