import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useAuthStore } from "@/renderer/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { AuthCard } from "./auth-card";

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(formData);
      router.navigate({ to: "/dashboard" });
    } catch {
      // Error is handled by the store
    }
  };

  const handleQuickLogin = async () => {
    clearError();
    try {
      await useAuthStore.getState().quickLogin();
      router.navigate({ to: "/dashboard" });
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <AuthCard
      title="Welcome back!"
      description="We're so excited to see you again!"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive" className="bg-red-900/50 border-red-800">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="username" className="text-xs font-bold uppercase">
            Username
          </Label>
          <Input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Enter your username"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-bold uppercase">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter your password"
            required
          />
        </div>

        <div className="flex flex-col space-y-3 pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
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
    </AuthCard>
  );
}