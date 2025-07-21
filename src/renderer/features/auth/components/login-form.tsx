import { useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { useAuthStore } from "@/renderer/store/auth.store";

import { Alert, AlertDescription } from "@/renderer/components/ui/alert";
import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/renderer/components/ui/form";

import { AuthCard } from "./auth-card";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  className?: string;
}

function LoginForm(props: LoginFormProps) {
  const { className } = props;
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleSubmit = async (data: LoginFormData) => {
    clearError();

    try {
      await login(data);
      router.navigate({ to: "/user" });
    } catch {
      // Error is handled by the store
    }
  };

  const handleQuickLogin = async () => {
    clearError();
    try {
      await useAuthStore.getState().quickLogin();
      router.navigate({ to: "/user" });
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <AuthCard
      title="Welcome back!"
      description="We're so excited to see you again!"
      className={className}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-900/50 border-red-800">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase">
                  Username
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Enter your username"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase">
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col space-y-3 pt-2">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleQuickLogin}
              disabled={isLoading}
              className="w-full"
            >
              Quick Login (Demo)
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Need an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-normal"
                onClick={() => router.navigate({ to: "/auth/register" })}
              >
                Register
              </Button>
            </p>
          </div>
        </form>
      </Form>
    </AuthCard>
  );
}

export { LoginForm };
