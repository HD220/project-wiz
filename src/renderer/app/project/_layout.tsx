import { Outlet, createFileRoute } from "@tanstack/react-router";

export function ProjectBaseLayout() { // Renamed component for clarity from generic "Layout"
  return <Outlet />;
}

export const Route = createFileRoute("/project/_layout")({ // Corrected definition
  component: ProjectBaseLayout,
});
