import { Link } from "@tanstack/react-router";
import { Plus, Settings, Folder } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ProjectSidebar } from "@/domains/projects/components/project-sidebar";

function DashboardButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-2xl bg-primary hover:bg-primary/90 hover:rounded-xl transition-all duration-200"
            asChild
          >
            <Link to="/">
              <Folder className="h-6 w-6 text-primary-foreground" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Dashboard</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function AddProjectButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-2xl border-2 border-dashed border-muted-foreground hover:border-solid hover:border-green-500 hover:bg-green-500/10 hover:rounded-xl transition-all duration-200"
            asChild
          >
            <Link to="/create-project">
              <Plus className="h-6 w-6 text-muted-foreground hover:text-green-500" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Adicionar Projeto</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function SettingsButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-2xl bg-muted hover:bg-muted/80 hover:rounded-xl transition-all duration-200"
            asChild
          >
            <Link to="/settings">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Configurações</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function AppSidebar() {
  return (
    <div className="w-18 bg-sidebar border-r border-border flex flex-col items-center py-3 space-y-2 h-full flex-shrink-0">
      <DashboardButton />

      <div className="w-8 h-0.5 bg-border rounded-full" />

      <div className="flex-1 overflow-hidden">
        <ProjectSidebar />
      </div>

      <AddProjectButton />

      <SettingsButton />
    </div>
  );
}
