import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/")({
  beforeLoad: async () => {
    // Default redirect to user area when accessing /_authenticated directly
    throw redirect({ to: "/user" });
  },
});
