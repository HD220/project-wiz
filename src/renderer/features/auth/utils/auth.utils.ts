import { LogIn, UserPlus, User, Lock, AtSign } from "lucide-react";
import * as React from "react";

import type { AuthMode } from "@/renderer/features/auth/auth.schema";

// Field configuration type
export interface AuthFieldConfig {
  name: string;
  label: string;
  type: "text" | "password";
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
  autoComplete: string;
}

// Get field configurations based on mode
export function getFieldsConfig(mode: AuthMode): AuthFieldConfig[] {
  const baseFields: AuthFieldConfig[] = [
    {
      name: "username",
      label: "Username",
      type: "text",
      placeholder:
        mode === "login" ? "Enter your username" : "Choose a unique username",
      icon: mode === "login" ? User : AtSign,
      autoComplete: "username",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder:
        mode === "login" ? "Enter your password" : "Create a secure password",
      icon: Lock,
      autoComplete: mode === "login" ? "current-password" : "new-password",
    },
  ];

  if (mode === "register") {
    return [
      {
        name: "name",
        label: "Display name",
        type: "text",
        placeholder: "Enter your display name",
        icon: User,
        autoComplete: "name",
      },
      ...baseFields,
      {
        name: "confirmPassword",
        label: "Confirm password",
        type: "password",
        placeholder: "Confirm your password",
        icon: Lock,
        autoComplete: "new-password",
      },
    ];
  }

  return baseFields;
}

// Get UI content based on mode
export function getUIContent(mode: AuthMode) {
  if (mode === "login") {
    return {
      title: "Welcome back!",
      description: "Sign in to continue to your workspace",
      submitText: "Sign in",
      submitLoadingText: "Signing in...",
      submitIcon: LogIn,
      navText: "Need an account?",
      navLinkText: "Create account",
      navTo: "/auth/register",
    };
  }

  return {
    title: "Create your account",
    description: "Join our platform and start creating amazing projects",
    submitText: "Create account",
    submitLoadingText: "Creating account...",
    submitIcon: UserPlus,
    navText: "Already have an account?",
    navLinkText: "Sign in",
    navTo: "/auth/login",
  };
}
