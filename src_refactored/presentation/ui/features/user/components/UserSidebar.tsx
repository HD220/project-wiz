import { Link } from "@tanstack/react-router";
// Removed User import
import { MessageSquare, Settings, Plus, Users, Search } from "lucide-react";
import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
// Separator import removed

// Helper for NavLink
interface UserNavLinkProps {
  to: string;
  children: React.ReactNode;
  // Prop name changed from 'Icon' to 'icon'
  icon?: React.ElementType;
  // Add other props like exact if needed for active state matching
}

// Parameter name changed for convention
function UserNavLink({ to, children, icon: iconComponent }: UserNavLinkProps) {
  // Assuming user-specific routes might be prefixed, e.g., /user/profile
  // For now, direct paths as passed.
  const fullPath = to.startsWith("/") ? to : `/user/${to}`;

  return (
    <Link
      // Removed 'as any'
      to={fullPath}
      className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
      activeProps={{
        className:
          "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50 font-semibold",
      }}
    >
      {iconComponent &&
        React.createElement(iconComponent, { className: "h-4 w-4" })}
      <span>{children}</span>
    </Link>
  );
}

interface DirectMessageItemProps {
  id: string;
  name: string;
  avatarUrl?: string;
  // Example status
  status?: "online" | "offline" | "idle";
  // Example if this DM is currently active
  isActive?: boolean;
}

function DirectMessageItem({
  id = "",
  name,
  avatarUrl,
  status = "offline",
  isActive,
}: DirectMessageItemProps) {
  const initials = name
    .split(" ")
    .map((namePart) => namePart[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
  return (
    <Link
      to="/app/user/dm/$conversationId"
      params={{ conversationId: id }}
      className={`flex items-center space-x-3 px-3 py-1.5 text-sm group rounded-md
                        ${
                          isActive
                            ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50 font-medium"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
      activeProps={{
        className:
          "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50 font-medium",
      }}
    >
      <Avatar className="h-6 w-6 text-xs">
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback
          className={`${status === "online" ? "border-2 border-green-500" : ""}`}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="truncate flex-1">{name}</span>
      {/* Optional: Unread count or close button on hover */}
      {/* <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100">X</Button> */}
    </Link>
  );
}

interface UserSidebarProps {
  className?: string;
}

export function UserSidebar({ className }: UserSidebarProps) {
  // Placeholder data
  const currentUser = {
    name: "Jules Agent",
    // Example avatar
    avatarUrl: "https://github.com/shadcn.png",
    status: "online",
  };

  const directMessages: DirectMessageItemProps[] = [
    {
      id: "1",
      name: "Alice Wonderland",
      avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
      status: "online",
      isActive: true,
    },
    {
      id: "2",
      name: "Bob The Builder",
      avatarUrl: "https://randomuser.me/api/portraits/men/44.jpg",
      status: "offline",
    },
    {
      id: "3",
      name: "Charlie Chaplin",
      avatarUrl: "https://randomuser.me/api/portraits/men/46.jpg",
      status: "idle",
    },
  ];

  return (
    <div
      className={`flex flex-col h-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 w-60 ${className || ""}`}
    >
      {/* Top section (e.g., Search DMs or "Find or start a conversation") */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-700">
        <Button
          variant="secondary"
          className="w-full justify-start text-sm text-slate-500 dark:text-slate-400"
        >
          <Search className="h-4 w-4 mr-2" />
          Find or start a conversation
        </Button>
      </div>

      <ScrollArea className="flex-grow px-2 py-2">
        <nav className="space-y-0.5">
          <UserNavLink to="/friends" icon={Users}>
            Friends
          </UserNavLink>
          {/* <UserNavLink to="/nitro" icon={Zap}>Nitro</UserNavLink> Placeholder */}
          {/* Using MessageSquare as placeholder */}
          <UserNavLink to="/shop" icon={MessageSquare}>
            Shop
          </UserNavLink>
        </nav>

        <div className="mt-3 px-1">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2">
              Direct Messages
            </h3>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span className="sr-only">Create DM</span>
            </Button>
          </div>
          <div className="space-y-0.5">
            {directMessages.map((dm) => (
              <DirectMessageItem key={dm.id} {...dm} />
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* User Panel Footer */}
      <div className="p-2 mt-auto border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
            <AvatarFallback>
              {currentUser.name
                .split(" ")
                .map((namePart) => namePart[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium truncate">{currentUser.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {currentUser.status}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Settings className="h-4 w-4" />
            <span className="sr-only">User Settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UserSidebar;
