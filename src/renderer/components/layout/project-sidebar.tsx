import { useState } from "react";
import { cn } from "@/renderer/lib/utils";
import { Button } from "@/renderer/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/renderer/components/ui/tooltip";
import { Plus, Settings, Folder } from "lucide-react";

interface Project {
  id: string;
  name: string;
  avatarUrl?: string;
  hasNotifications?: boolean;
}

interface ProjectSidebarProps {
  projects: Project[];
  selectedProjectId?: string;
  onProjectSelect: (projectId: string) => void;
  onCreateProject: () => void;
  onSettings: () => void;
}

export function ProjectSidebar({
  projects,
  selectedProjectId,
  onProjectSelect,
  onCreateProject,
  onSettings,
}: ProjectSidebarProps) {
  return (
    <div className="w-[72px] bg-gray-900 flex flex-col items-center py-3 space-y-2">
      {/* Home/Dashboard */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-[24px] bg-brand-500 hover:bg-brand-600 hover:rounded-[16px] transition-all duration-200"
            >
              <Folder className="h-6 w-6 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Dashboard</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Separator */}
      <div className="w-8 h-[2px] bg-gray-600 rounded-full" />

      {/* Project List */}
      <div className="flex flex-col space-y-2 flex-1">
        {projects.map((project) => (
          <TooltipProvider key={project.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onProjectSelect(project.id)}
                  className={cn(
                    "w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 relative",
                    selectedProjectId === project.id
                      ? "bg-brand-500 rounded-[16px]"
                      : "bg-gray-700 hover:bg-gray-600",
                  )}
                >
                  {project.avatarUrl ? (
                    <img
                      src={project.avatarUrl}
                      alt={project.name}
                      className="w-full h-full rounded-inherit"
                    />
                  ) : (
                    <span className="text-white font-semibold">
                      {project.name.charAt(0).toUpperCase()}
                    </span>
                  )}

                  {/* Notification indicator */}
                  {project.hasNotifications && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-gray-900" />
                  )}

                  {/* Selection indicator */}
                  {selectedProjectId === project.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-1 h-8 bg-white rounded-r-full" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{project.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {/* Add Project Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCreateProject}
              className="w-12 h-12 rounded-[24px] bg-gray-700 hover:bg-green-600 hover:rounded-[16px] transition-all duration-200"
            >
              <Plus className="h-6 w-6 text-green-500 hover:text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Add a Project</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Settings */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettings}
              className="w-12 h-12 rounded-[24px] bg-gray-700 hover:bg-gray-600 hover:rounded-[16px] transition-all duration-200"
            >
              <Settings className="h-5 w-5 text-gray-300" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}