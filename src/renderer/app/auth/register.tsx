import { createFileRoute } from "@tanstack/react-router";
import { RegisterForm } from "@/features/auth/components/register-form";

function RegisterPage() {
  return <RegisterForm />;
}

export const Route = createFileRoute("/auth/register")({
  component: RegisterPage,
});