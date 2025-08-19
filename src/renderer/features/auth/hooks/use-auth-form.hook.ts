import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useLocation } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

import { useAuth } from "@/renderer/contexts/auth.context";
import {
  AuthMode,
  AuthFormData,
  LoginFormData,
  RegisterFormData,
  loginSchema,
  registerSchema,
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

  if (mode === "login") {
    const form = useForm<LoginFormData>({
      resolver: zodResolver(loginSchema),
      defaultValues: {
        username: "",
        password: "",
      },
    });

    const handleSubmit = async (data: LoginFormData) => {
      try {
        await login(data);
        await new Promise((resolve) => setTimeout(resolve, 0));
        const redirectTo = search?.redirect || "/user";
        router.navigate({ to: redirectTo });
      } catch (error) {
        form.setError("root", {
          message: error instanceof Error ? error.message : "Login failed",
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

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (data: RegisterFormData) => {
    try {
      const response = await window.api.auth.register({
        name: data.name,
        username: data.username,
        password: data.password,
      });

      if (!response.success) {
        throw new Error(response.error || "Registration failed");
      }

      await login({
        username: data.username,
        password: data.password,
      });

      router.navigate({ to: "/user" });
    } catch (error) {
      form.setError("root", {
        message: error instanceof Error ? error.message : "Registration failed",
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
