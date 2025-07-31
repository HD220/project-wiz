import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AuthLayout } from "@/renderer/features/auth/components/auth-layout";

function AuthRoutePage() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}

export const Route = createFileRoute("/auth")({
  component: AuthRoutePage,
});
