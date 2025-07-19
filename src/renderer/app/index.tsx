import { createFileRoute } from "@tanstack/react-router";

function Index() {
  return (
    <div className="p-2">
      <h3>Welcome to Project Wiz!</h3>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: Index,
});
