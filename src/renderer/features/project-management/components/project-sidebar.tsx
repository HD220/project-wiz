import { useProjects } from "../hooks/use-projects.hook";
import { ProjectSidebarItem } from "./project-sidebar-item";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectSidebarProps {
  // No more props drilling needed!
}

function ProjectListSkeleton() {
  return (
    <div className="flex flex-col space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="w-12 h-12 rounded-2xl" />
      ))}
    </div>
  );
}

export function ProjectSidebar({}: ProjectSidebarProps) {
  const { projects, isLoading } = useProjects({ status: "active" });

  if (isLoading) {
    return <ProjectListSkeleton />;
  }

  return (
    <div className="flex flex-col space-y-2 h-full overflow-y-auto">
      {projects.map((project) => (
        <ProjectSidebarItem
          key={project.id}
          project={project}
        />
      ))}
    </div>
  );
}
