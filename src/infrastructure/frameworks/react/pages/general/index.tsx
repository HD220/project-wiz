import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/general/")({
  component: Home,
});

export function Home() {
  return <h1>User</h1>;
}
