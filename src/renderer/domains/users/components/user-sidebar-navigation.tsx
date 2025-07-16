import { Home, Settings, MessageSquare } from "lucide-react";
import { CustomLink } from "../../../../components/custom-link";

export function UserSidebarNavigation() {
  return (
    <div className="space-y-0.5 mb-4">
      <CustomLink
        to="/"
        className="w-full justify-start px-2 py-1.5 h-auto"
        activeOptions={{ exact: true }}
        activeProps={{
          className: "bg-secondary text-secondary-foreground",
        }}
      >
        <Home className="w-4 h-4 mr-2 text-muted-foreground" />
        <span>Dashboard</span>
      </CustomLink>
      <CustomLink
        to="/settings"
        className="w-full justify-start px-2 py-1.5 h-auto"
        activeProps={{
          className: "bg-secondary text-secondary-foreground",
        }}
      >
        <Settings className="w-4 h-4 mr-2 text-muted-foreground" />
        <span>Configurações</span>
      </CustomLink>
      <CustomLink
        to="/ai-chat-test"
        className="w-full justify-start px-2 py-1.5 h-auto"
        activeProps={{
          className: "bg-secondary text-secondary-foreground",
        }}
      >
        <MessageSquare className="w-4 h-4 mr-2 text-muted-foreground" />
        <span>AI Chat Test</span>
      </CustomLink>
    </div>
  );
}
