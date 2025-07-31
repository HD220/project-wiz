import { createFileRoute } from "@tanstack/react-router";

import { AuthForm } from "@/renderer/features/auth/components/auth-form";

function RegisterPage() {
  return <AuthForm mode="register" />;
}

export const Route = createFileRoute("/auth/register")({
  component: RegisterPage,
});
