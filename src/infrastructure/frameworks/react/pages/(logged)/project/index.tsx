import { ProjectListPage } from "@/components/projects/project-list-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(logged)/project/")({
  component: ProjectsHome, // Renamed component for clarity
});

function ProjectsHome() {
  return <ProjectListPage />;
}
