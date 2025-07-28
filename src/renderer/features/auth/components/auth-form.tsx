import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useLocation } from "@tanstack/react-router";
import {
  LogIn,
  UserPlus,
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  AtSign,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/renderer/components/ui/alert";
import { Button } from "@/renderer/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/renderer/components/ui/form";
import { Input } from "@/renderer/components/ui/input";
import { useAuth } from "@/renderer/contexts/auth.context";
import {
  type AuthMode,
  type AuthFormData,
  type LoginFormData,
  type RegisterFormData,
  getAuthSchema,
  getDefaultValues,
} from "@/renderer/features/auth/auth.schema";
import { AuthCard } from "@/renderer/features/auth/components/auth-layout";

// Field configuration type
interface AuthFieldConfig {
  name: string;
  label: string;
  type: "text" | "password";
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
  autoComplete: string;
}

// Get field configurations based on mode
function getFieldsConfig(mode: AuthMode): AuthFieldConfig[] {
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
function getUIContent(mode: AuthMode) {
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

// Password field with visibility toggle - extracted shared component
interface AuthPasswordFieldProps {
  field: {
    name: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
  };
  config: AuthFieldConfig;
  disabled: boolean;
}

function AuthPasswordField({
  field,
  config,
  disabled,
}: AuthPasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const IconComponent = config.icon;

  return (
    <div className="relative group">
      <IconComponent
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-ring transition-colors duration-200"
        aria-hidden="true"
      />
      <Input
        {...field}
        type={showPassword ? "text" : "password"}
        placeholder={config.placeholder}
        disabled={disabled}
        className="
          pl-10 pr-10
          h-10
          text-sm
          border-input
          bg-background
          transition-all duration-200
          hover:border-ring/50
          focus:border-ring
          focus:ring-2
          focus:ring-ring/20
          focus:ring-offset-0
          disabled:opacity-60
          disabled:cursor-not-allowed
        "
        aria-describedby={field.name + "-error"}
        autoComplete={config.autoComplete}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        onClick={() => setShowPassword(!showPassword)}
        tabIndex={-1}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Eye className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}

// Regular text field component
interface AuthTextFieldProps {
  field: {
    name: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
  };
  config: AuthFieldConfig;
  disabled: boolean;
}

function AuthTextField({ field, config, disabled }: AuthTextFieldProps) {
  const IconComponent = config.icon;

  return (
    <div className="relative group">
      <IconComponent
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-ring transition-colors duration-200"
        aria-hidden="true"
      />
      <Input
        {...field}
        type="text"
        placeholder={config.placeholder}
        disabled={disabled}
        className="
          pl-10 
          h-10
          text-sm
          border-input
          bg-background
          transition-all duration-200
          hover:border-ring/50
          focus:border-ring
          focus:ring-2
          focus:ring-ring/20
          focus:ring-offset-0
          disabled:opacity-60
          disabled:cursor-not-allowed
        "
        aria-describedby={field.name + "-error"}
        autoComplete={config.autoComplete}
      />
    </div>
  );
}

// Main AuthForm component
interface AuthFormProps {
  mode: AuthMode;
  className?: string;
}

export function AuthForm({ mode, className }: AuthFormProps) {
  const router = useRouter();
  const { login } = useAuth();
  const location = useLocation();

  // Get redirect parameter from search params only for login
  const search =
    mode === "login" ? (location.search as { redirect?: string }) : undefined;

  const schema = getAuthSchema(mode);
  const defaultValues = getDefaultValues(mode);
  const fieldsConfig = getFieldsConfig(mode);
  const uiContent = getUIContent(mode);

  const form = useForm<AuthFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = async (data: AuthFormData) => {
    try {
      if (mode === "login") {
        const loginData = data as LoginFormData;
        await login(loginData);
        // Wait for context update before navigating
        await new Promise((resolve) => setTimeout(resolve, 0));
        // Use redirect param if available, otherwise go to /user
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

        // Automatically log in after registration
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

  return (
    <AuthCard
      title={uiContent.title}
      description={uiContent.description}
      className={className}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className={mode === "login" ? "space-y-3" : "space-y-2.5"}
          noValidate
          aria-label={`${mode === "login" ? "Sign in" : "Create account"} form`}
        >
          <div className={mode === "login" ? "space-y-3" : "space-y-2.5"}>
            {fieldsConfig.map((config) => (
              <FormField
                key={config.name}
                control={form.control}
                name={config.name as keyof AuthFormData}
                render={({ field }) => (
                  <FormItem className="space-y-[var(--spacing-component-xs)]">
                    <FormLabel className="text-sm font-medium text-foreground">
                      {config.label}
                    </FormLabel>
                    <FormControl>
                      {config.type === "password" ? (
                        <AuthPasswordField
                          field={field}
                          config={config}
                          disabled={form.formState.isSubmitting}
                        />
                      ) : (
                        <AuthTextField
                          field={field}
                          config={config}
                          disabled={form.formState.isSubmitting}
                        />
                      )}
                    </FormControl>
                    <FormMessage
                      id={field.name + "-error"}
                      className="text-xs text-destructive flex items-center gap-1"
                    />
                  </FormItem>
                )}
              />
            ))}
          </div>

          <div className="flex flex-col space-y-[var(--spacing-component-sm)] pt-1.5">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="
                w-full 
                h-10
                text-sm
                font-medium
                bg-primary 
                hover:bg-primary/90
                focus:bg-primary/90
                text-primary-foreground
                transition-all duration-200
                hover:shadow-lg
                hover:shadow-primary/25
                hover:-translate-y-0.5
                active:translate-y-0
                active:shadow-md
                disabled:opacity-60
                disabled:hover:translate-y-0
                disabled:hover:shadow-none
                disabled:cursor-not-allowed
              "
              aria-describedby={`${mode}-status`}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>{uiContent.submitLoadingText}</span>
                </>
              ) : (
                <>
                  <uiContent.submitIcon
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                  />
                  <span>{uiContent.submitText}</span>
                </>
              )}
            </Button>

            {form.formState.errors.root && (
              <Alert
                variant="destructive"
                role="alert"
                aria-live="polite"
                className="
                  border-destructive/20
                  bg-destructive/5
                  text-destructive
                  [&>svg]:text-destructive
                  animate-in slide-in-from-top-1 duration-200
                "
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription
                  id={`${mode}-status`}
                  className="text-sm font-medium"
                >
                  {form.formState.errors.root.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-center pt-0.5">
              <p className="text-sm text-muted-foreground">
                {uiContent.navText}{" "}
                <Button
                  variant="link"
                  className="
                    p-0 h-auto 
                    text-sm
                    font-medium
                    text-primary
                    hover:text-primary/80
                    underline-offset-4
                    transition-colors duration-200
                  "
                  onClick={() => router.navigate({ to: uiContent.navTo })}
                  type="button"
                >
                  {uiContent.navLinkText}
                </Button>
              </p>
            </div>
          </div>
        </form>
      </Form>
    </AuthCard>
  );
}
