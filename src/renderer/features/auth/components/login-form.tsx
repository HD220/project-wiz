import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearch } from "@tanstack/react-router";
import { LogIn, User } from "lucide-react";
import { useForm } from "react-hook-form";
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

const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(50, "Username too long")
    .trim(),
  password: z
    .string()
    .min(1, "Password is required")
    .max(100, "Password too long"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  className?: string;
}

function LoginForm(props: LoginFormProps) {
  const { className } = props;
  const router = useRouter();
  const { login } = useAuth();
  const search = useSearch({ from: "/auth/login" });

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
      // Aguardar context update antes de navegar
      await new Promise((resolve) => setTimeout(resolve, 0));
      // Usar redirect param se disponível, senão ir para /user
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
          className="space-y-[var(--spacing-component-lg)]"
          noValidate
          aria-label="Sign in form"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[var(--font-size-sm)] font-[var(--font-weight-medium)] text-foreground">
                  Username
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter your username"
                      disabled={form.formState.isSubmitting}
                      className="pl-10 h-11 text-[var(--font-size-base)] transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      aria-describedby={field.name + "-error"}
                      autoComplete="username"
                    />
                  </div>
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
                  <Input
                    {...field}
                    type="password"
                    placeholder="Enter your password"
                    disabled={form.formState.isSubmitting}
                    className="h-11 text-[var(--font-size-base)] transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    aria-describedby={field.name + "-error"}
                    autoComplete="current-password"
                  />
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
              aria-describedby="login-status"
            >
              {form.formState.isSubmitting ? (
                <>
                  <StatusIndicator.Loading
                    size="sm"
                    showLabel={false}
                    className="mr-2"
                  />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>Sign In</span>
                </>
              )}
            </Button>

            {form.formState.errors.root && (
              <Alert variant="destructive" role="alert" aria-live="polite">
                <AlertDescription id="login-status">
                  {form.formState.errors.root.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-center">
              <p className="text-[var(--font-size-sm)] text-muted-foreground">
                Need an account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto font-[var(--font-weight-medium)] text-[var(--font-size-sm)] hover:underline focus:underline transition-colors"
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

export { LoginForm };
