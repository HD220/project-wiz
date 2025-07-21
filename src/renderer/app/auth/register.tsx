import { createFileRoute } from "@tanstack/react-router";

import { RegisterForm } from "@/renderer/features/auth/components/register-form";

function RegisterPage() {
  return <RegisterForm />;
}

export const Route = createFileRoute("/auth/register")({
  component: RegisterPage,
});
