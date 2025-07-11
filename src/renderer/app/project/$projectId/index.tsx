import { createFileRoute } from '@tanstack/react-router';

export function ProjectIndexPage() {
  // const { projectId } = Route.useParams(); // Will be used later
  return <div>Project Main Page</div>;
}

export const Route = createFileRoute('/project/$projectId/')({
  component: ProjectIndexPage
});
