import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/project/$id/")({
  component: RouteComponent,
  loader(ctx) {
    const params = ctx.params;
    return { ...params };
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <div>Hello {`/project/${id}/`}!</div>;
}
