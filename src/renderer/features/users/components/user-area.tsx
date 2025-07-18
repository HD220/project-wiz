import { mockUser } from "@/lib/placeholders";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar.tsx";

export function UserArea() {
  return (
    <div className="p-3 border-t border-border flex-none">
      <div className="flex items-center gap-2">
        <Avatar className="w-8 h-8">
          <AvatarImage src={mockUser.avatar} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {mockUser.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground truncate">
            {mockUser.name}
          </div>
          <div className="text-xs text-muted-foreground">Project Manager</div>
        </div>
      </div>
    </div>
  );
}
