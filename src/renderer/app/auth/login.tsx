import { createFileRoute } from "@tanstack/react-router";

import { LoginForm } from "@/renderer/features/auth/components/login-form";

function LoginPage() {
  return <LoginForm />;
}

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});
