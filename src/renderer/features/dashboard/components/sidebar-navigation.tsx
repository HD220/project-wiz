import { Hash, Users, Settings } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { NavigationItem } from "./navigation-item";

export function SidebarNavigation() {
  return (
    <div className="flex-1 p-2 space-y-1">
      <NavigationItem icon={Hash} label="general" isActive />
      <NavigationItem icon={Users} label="team" />
      
      <Separator className="my-2" />
      
      <NavigationItem icon={Settings} label="Settings" />
    </div>
  );
}