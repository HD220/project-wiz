import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/user/settings/llm-providers/edit")({
  component: Outlet,
});