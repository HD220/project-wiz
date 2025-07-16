import { Home, Users, CheckSquare, FileText } from "lucide-react";

import { CustomLink } from "@/components/custom-link";

interface NavigationMenuItemsProps {
  projectId: string;
}

export function NavigationMenuItems({ projectId }: NavigationMenuItemsProps) {
  return (
    <div className="space-y-0.5 mb-4">
      <CustomLink
        to="/project/$projectId"
        params={{ projectId }}
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
        to="/project/$projectId/agents"
        params={{ projectId }}
        className="w-full justify-start px-2 py-1.5 h-auto"
        activeProps={{
          className: "bg-secondary text-secondary-foreground",
        }}
      >
        <Users className="w-4 h-4 mr-2 text-muted-foreground" />
        <span>Agentes</span>
      </CustomLink>
      <CustomLink
        to="/project/$projectId/tasks"
        params={{ projectId }}
        className="w-full justify-start px-2 py-1.5 h-auto"
        activeProps={{
          className: "bg-secondary text-secondary-foreground",
        }}
      >
        <CheckSquare className="w-4 h-4 mr-2 text-muted-foreground" />
        <span>Tarefas</span>
      </CustomLink>
      <CustomLink
        to="/project/$projectId/docs"
        params={{ projectId }}
        className="w-full justify-start px-2 py-1.5 h-auto"
        activeProps={{
          className: "bg-secondary text-secondary-foreground",
        }}
      >
        <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
        <span>Documentos</span>
      </CustomLink>
    </div>
  );
}
