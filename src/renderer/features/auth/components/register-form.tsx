import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useAuthStore } from "@/renderer/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { AuthCard } from "./auth-card";

export function RegisterForm() {
  const router = useRouter();
  const { isLoading, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    try {
      const response = await window.api.auth.register({
        name: formData.name,
        username: formData.username,
        password: formData.password,
      });

      if (response.success) {
        await useAuthStore.getState().login({
          username: formData.username,
          password: formData.password,
        });
        router.navigate({ to: "/dashboard" });
      }
    } catch {
      // Error handling
    }
  };

  const isPasswordMismatch = formData.password !== formData.confirmPassword && formData.confirmPassword !== "";

  return (
    <AuthCard
      title="Create an account"
      description="Join our community today!"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive" className="bg-red-900/50 border-red-800">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs font-bold uppercase">
            Display Name
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter your display name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="text-xs font-bold uppercase">
            Username
          </Label>
          <Input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Choose a username"
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Confirm your password"
            required
          />
          {isPasswordMismatch && (
            <p className="text-xs text-destructive">Passwords do not match</p>
          )}
        </div>

        <div className="flex flex-col space-y-3 pt-2">
          <Button
            type="submit"
            disabled={isLoading || isPasswordMismatch}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={() => router.navigate({ to: "/auth/login" })}
            >
              Sign In
            </Button>
          </p>
        </div>
      </form>
    </AuthCard>
  );
}