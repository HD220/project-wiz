import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { LoginForm } from "@/renderer/features/auth/components/login-form";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

function LoginPage() {
  return <LoginForm />;
}

export const Route = createFileRoute("/auth/login")({
  validateSearch: (search) => loginSearchSchema.parse(search),
  component: LoginPage,
});
