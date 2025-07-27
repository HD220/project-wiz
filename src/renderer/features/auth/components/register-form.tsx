import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { UserPlus, User, Lock, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";

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
import { StatusIndicator } from "@/renderer/components/shared";
import { useAuth } from "@/renderer/contexts/auth.context";
import { AuthCard } from "@/renderer/features/auth/components/auth-card";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must not exceed 100 characters")
      .trim(),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must not exceed 50 characters")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, underscores and hyphens",
      ),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must not exceed 100 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  className?: string;
}

function RegisterForm(props: RegisterFormProps) {
  const { className } = props;
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

      // Logar automaticamente após registro
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

  return (
    <AuthCard
      title="Create your account"
      description="Join our platform and start building amazing projects"
      className={className}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-[var(--spacing-component-lg)]"
          noValidate
          aria-label="Create account form"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[var(--font-size-sm)] font-[var(--font-weight-medium)] text-foreground">
                  Display Name
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      {...field}
                      placeholder="Enter your display name"
                      disabled={form.formState.isSubmitting}
                      className="pl-10 h-11 text-[var(--font-size-base)] transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      aria-describedby={field.name + "-error"}
                      autoComplete="name"
                    />
                  </div>
                </FormControl>
                <FormMessage id={field.name + "-error"} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[var(--font-size-sm)] font-[var(--font-weight-medium)] text-foreground">
                  Username
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Choose a unique username"
                    disabled={form.formState.isSubmitting}
                    className="h-11 text-[var(--font-size-base)] transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    aria-describedby={field.name + "-error"}
                    autoComplete="username"
                  />
                </FormControl>
                <FormMessage id={field.name + "-error"} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[var(--font-size-sm)] font-[var(--font-weight-medium)] text-foreground">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a secure password"
                      disabled={form.formState.isSubmitting}
                      className="pl-10 pr-10 h-11 text-[var(--font-size-base)] transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      aria-describedby={field.name + "-error"}
                      autoComplete="new-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage id={field.name + "-error"} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[var(--font-size-sm)] font-[var(--font-weight-medium)] text-foreground">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      {...field}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      disabled={form.formState.isSubmitting}
                      className="pl-10 pr-10 h-11 text-[var(--font-size-base)] transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      aria-describedby={field.name + "-error"}
                      autoComplete="new-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      tabIndex={-1}
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage id={field.name + "-error"} />
              </FormItem>
            )}
          />

          <div className="flex flex-col space-y-[var(--spacing-component-md)] pt-[var(--spacing-component-sm)]">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full h-11 text-[var(--font-size-base)] font-[var(--font-weight-medium)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              aria-describedby="register-status"
            >
              {form.formState.isSubmitting ? (
                <>
                  <StatusIndicator.Loading
                    size="sm"
                    showLabel={false}
                    className="mr-2"
                  />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>Create Account</span>
                </>
              )}
            </Button>

            {form.formState.errors.root && (
              <Alert variant="destructive" role="alert" aria-live="polite">
                <AlertDescription id="register-status">
                  {form.formState.errors.root.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-center">
              <p className="text-[var(--font-size-sm)] text-muted-foreground">
                Already have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto font-[var(--font-weight-medium)] text-[var(--font-size-sm)] hover:underline focus:underline transition-colors"
                  onClick={() => router.navigate({ to: "/auth/login" })}
                  type="button"
                >
                  Sign in
                </Button>
              </p>
            </div>
          </div>
        </form>
      </Form>
    </AuthCard>
  );
}

export { RegisterForm };
export type { RegisterFormProps };
