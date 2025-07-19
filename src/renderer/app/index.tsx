import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: function Index() {
    return (
      <div className="p-2">
        <h3>Welcome to Project Wiz!</h3>
      </div>
    );
  },
});
