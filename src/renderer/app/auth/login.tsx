import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { AuthForm } from "@/renderer/features/auth/components/auth-form";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

function LoginPage() {
  return <AuthForm mode="login" />;
}

export const Route = createFileRoute("/auth/login")({
  validateSearch: (search) => loginSearchSchema.parse(search),
  component: LoginPage,
});
