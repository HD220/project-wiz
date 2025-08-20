import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useLocation } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

import { useAuth } from "@/renderer/contexts/auth.context";
import {
  AuthMode,
  LoginFormData,
  RegisterFormData,
  loginSchema,
  registerSchema,
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

  // Always call both hooks to maintain hook order
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleLoginSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      await new Promise((resolve) => setTimeout(resolve, 0));
      const redirectTo = search?.redirect || "/user";
      router.navigate({ to: redirectTo });
    } catch (error) {
      loginForm.setError("root", {
        message: error instanceof Error ? error.message : "Login failed",
      });
    }
  };

  const handleRegisterSubmit = async (data: RegisterFormData) => {
    try {
      const response = await window.api.user.create({
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
      registerForm.setError("root", {
        message: error instanceof Error ? error.message : "Registration failed",
      });
    }
  };

  // Return the appropriate form and handler based on mode
  if (mode === "login") {
    return {
      form: loginForm,
      handleSubmit: handleLoginSubmit,
      fieldsConfig: getFieldsConfig(mode),
      uiContent: getUIContent(mode),
    };
  }

  return {
    form: registerForm,
    handleSubmit: handleRegisterSubmit,
    fieldsConfig: getFieldsConfig(mode),
    uiContent: getUIContent(mode),
  };
}
