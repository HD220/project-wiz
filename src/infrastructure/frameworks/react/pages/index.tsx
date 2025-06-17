import { userQuery } from "@/hooks/use-core";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    // TODO: Show global loading indicator here (e.g., NProgress.start() or context update)
    try {
      await userQuery();
    } catch (error) {
      // TODO: Hide global loading indicator here (e.g., NProgress.done() or context update)
      throw redirect({ to: "/onbording", replace: true });
    }
    // TODO: Hide global loading indicator here (e.g., NProgress.done() or context update)
    throw redirect({ to: "/user", replace: true });
  },
});
