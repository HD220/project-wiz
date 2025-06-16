import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(logged)/project/")({
  component: Home,
});

export function Home() {
  return <h1>Project</h1>;
}
