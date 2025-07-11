import { Outlet, createFileRoute } from "@tanstack/react-router";

export function ProjectBaseLayout() {
  return <Outlet />;
}

export const Route = createFileRoute("/project/_layout")({
  component: ProjectBaseLayout,
});
