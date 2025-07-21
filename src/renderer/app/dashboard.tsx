import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    // Redirect to new user route for compatibility
    throw redirect({ to: "/user" });
  },
});