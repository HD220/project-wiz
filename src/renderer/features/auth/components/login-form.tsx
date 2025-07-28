import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearch } from "@tanstack/react-router";
import {
  LogIn,
  User,
  Loader2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
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
import { useAuth } from "@/renderer/contexts/auth.context";
import { AuthCard } from "@/renderer/features/auth/components/auth-layout";

const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(50, "Username is too long")
    .trim(),
  password: z
    .string()
    .min(1, "Password is required")
    .max(100, "Password is too long"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  className?: string;
}

export function LoginForm(props: LoginFormProps) {
  const { className } = props;
  const router = useRouter();
  const { login } = useAuth();
  const search = useSearch({ from: "/auth/login" });
  const [showPassword, setShowPassword] = useState(false);

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
      // Wait for context update before navigating
      await new Promise((resolve) => setTimeout(resolve, 0));
      // Use redirect param if available, otherwise go to /user
      const redirectTo = search.redirect || "/user";
      router.navigate({ to: redirectTo });
    } catch (error) {
      form.setError("root", {
        message: error instanceof Error ? error.message : "Login failed",
      });
    }
  };

  return (
    <AuthCard
      title="Welcome back!"
      description="Sign in to continue to your workspace"
      className={className}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-3"
          noValidate
          aria-label="Sign in form"
        >
          <div className="space-y-2.5">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-sm font-medium text-foreground">
                    Username
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <User
                        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-ring transition-colors duration-200"
                        aria-hidden="true"
                      />
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter your username"
                        disabled={form.formState.isSubmitting}
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
                        autoComplete="username"
                      />
                    </div>
                  </FormControl>
                  <FormMessage
                    id={field.name + "-error"}
                    className="text-xs text-destructive flex items-center gap-1"
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-sm font-medium text-foreground">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Lock
                        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-ring transition-colors duration-200"
                        aria-hidden="true"
                      />
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        disabled={form.formState.isSubmitting}
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
                        autoComplete="current-password"
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
                  <FormMessage
                    id={field.name + "-error"}
                    className="text-xs text-destructive flex items-center gap-1"
                  />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col space-y-2.5 pt-1.5">
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
              aria-describedby="login-status"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>Sign in</span>
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
                  id="login-status"
                  className="text-sm font-medium"
                >
                  {form.formState.errors.root.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-center pt-0.5">
              <p className="text-sm text-muted-foreground">
                Need an account?{" "}
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
                  onClick={() => router.navigate({ to: "/auth/register" })}
                  type="button"
                >
                  Create account
                </Button>
              </p>
            </div>
          </div>
        </form>
      </Form>
    </AuthCard>
  );
}
