import { memo } from "react";

import { useProjects } from "../hooks/use-projects.hook";

import { ProjectSidebarItem } from "./project-sidebar-item";
import { ProjectSidebarSkeleton } from "./project-sidebar-skeleton";

interface ProjectSidebarProps {
  className?: string;
}

const ProjectSidebarComponent = function ProjectSidebar({
  className,
}: ProjectSidebarProps) {
  const { projects, isLoading } = useProjects({ status: "active" });

  if (isLoading) {
    return <ProjectSidebarSkeleton />;
  }

  return (
    <div className="flex flex-col space-y-2 h-full overflow-y-auto">
      {projects.map((project) => (
        <ProjectSidebarItem key={project.id} project={project} />
      ))}
    </div>
  );
};

export const ProjectSidebar = memo(ProjectSidebarComponent);
