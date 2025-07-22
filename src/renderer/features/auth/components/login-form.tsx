import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
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
import { useAuth } from "@/renderer/contexts/auth.context";

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
  const { login, isLoading, error, clearError } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleSubmit = async (
    data: LoginFormData,
    event?: React.BaseSyntheticEvent,
  ) => {
    event?.preventDefault();
    clearError();

    try {
      console.log("Attempting login with:", data);
      await login(data);
      console.log("Login successful, navigating...");
      router.navigate({ to: "/user" });
    } catch (error) {
      console.error("Login error:", error);
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data = form.getValues();
            handleSubmit(data, e);
          }}
          className="space-y-4"
        >
          {error && (
            <Alert
              variant="destructive"
              className="bg-red-900/50 border-red-800"
            >
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
