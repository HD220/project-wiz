import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useLocation } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

import { useAuth } from "@/renderer/contexts/auth.context";
import {
  AuthMode,
  AuthFormData,
  LoginFormData,
  RegisterFormData,
  getAuthSchema,
  getDefaultValues,
  getFieldsConfig,
  getUIContent,
} from "@/renderer/features/auth/auth.schema";

interface UseAuthFormProps {
  mode: AuthMode;
}

export function useAuthForm({ mode }: UseAuthFormProps) {
  const router = useRouter();
  const { login } = useAuth();
  const location = useLocation();

  const search =
    mode === "login" ? (location.search as { redirect?: string }) : undefined;

  const schema = getAuthSchema(mode);
  const defaultValues = getDefaultValues(mode);

  const form = useForm<AuthFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = async (data: AuthFormData) => {
    try {
      if (mode === "login") {
        const loginData = data as LoginFormData;
        await login(loginData);
        await new Promise((resolve) => setTimeout(resolve, 0));
        const redirectTo = search?.redirect || "/user";
        router.navigate({ to: redirectTo });
      } else {
        const registerData = data as RegisterFormData;
        const response = await window.api.auth.register({
          name: registerData.name,
          username: registerData.username,
          password: registerData.password,
        });

        if (!response.success) {
          throw new Error(response.error || "Registration failed");
        }

        await login({
          username: registerData.username,
          password: registerData.password,
        });

        router.navigate({ to: "/user" });
      }
    } catch (error) {
      form.setError("root", {
        message:
          error instanceof Error
            ? error.message
            : `${mode === "login" ? "Login" : "Registration"} failed`,
      });
    }
  };

  return {
    form,
    handleSubmit,
    fieldsConfig: getFieldsConfig(mode),
    uiContent: getUIContent(mode),
  };
}
