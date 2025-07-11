import { Outlet } from "@tanstack/react-router";

export function Layout() {
  return <Outlet />;
}

export const Route = {
  component: Layout,
};
