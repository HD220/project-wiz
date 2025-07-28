import { ReactNode } from "react";

import { Card, CardContent, CardHeader } from "@/renderer/components/ui/card";
import { cn } from "@/renderer/lib/utils";

interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AuthLayout(props: AuthLayoutProps) {
  const { children, className } = props;

  return (
    <div
      className={cn(
        "min-h-screen w-full bg-gradient-to-br from-background via-muted/30 to-muted/50",
        "flex items-center justify-center",
        "p-6",
        "relative overflow-hidden",
        className,
      )}
      role="main"
      aria-label="Authentication page"
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      {/* Content container with proper semantic structure */}
      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  );
}

// Compound Components for Auth

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthCard(props: AuthCardProps) {
  const { title, description, children, className } = props;

  return (
    <Card
      className={cn(
        "w-full max-w-md mx-auto transition-all duration-200 hover:shadow-md",
        "p-6 space-y-5",
        "shadow-lg border-border/50 bg-card/95 backdrop-blur-sm",
        "auth-form-enter", // Animation class
        className,
      )}
    >
      <CardHeader className="text-center space-y-2 transition-colors duration-200">
        <h3 className="text-2xl font-bold leading-tight tracking-tight text-foreground transition-colors duration-200">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-normal transition-colors duration-200">
          {description}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}
