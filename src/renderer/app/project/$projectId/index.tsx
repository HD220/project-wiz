import { createFileRoute } from '@tanstack/react-router';

export function ProjectIndexPage() {
  return <div>Project Main Page</div>;
}

export const Route = createFileRoute('/project/$projectId/')({
  component: ProjectIndexPage
});
