import { Hash, MessageCircle, Settings } from "lucide-react";

import { Separator } from "@/components/ui/separator";

import { NavigationItem } from "./navigation-item";

export function SidebarNavigation() {
  return (
    <div className="flex-1 p-2 space-y-1">
      <NavigationItem 
        to="/user" 
        icon={Hash} 
        label="Dashboard"
        activeOptions={{ exact: true }}
      />
      <NavigationItem 
        to="/user/dm"
        icon={MessageCircle} 
        label="Direct Messages"
      />

      <Separator className="my-2" />

      <NavigationItem 
        to="/user/settings"
        icon={Settings} 
        label="Settings"
      />
    </div>
  );
}
