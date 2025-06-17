import { ProjectDetailPage } from "@/components/projects/project-detail-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(logged)/project/$id/")({
  component: ProjectDetailRouteComponent,
  // Optional: Loader to fetch data if not handled purely by placeholder logic in component
  // loader: ({ params }) => {
  //   // Here you could fetch actual project data using params.id
  //   // For now, the component handles placeholder fetching
  //   return { projectId: params.id };
  // }
});

function ProjectDetailRouteComponent() {
  const { id: projectId } = Route.useParams(); // Get projectId from route params
  // const { projectId } = Route.useLoaderData(); // If using loader

  return <ProjectDetailPage projectId={projectId} />;
}
