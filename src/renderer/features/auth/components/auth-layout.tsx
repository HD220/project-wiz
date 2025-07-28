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
        "min-h-screen w-full",
        "flex items-center justify-center",
        "p-6",
        "relative overflow-hidden",
        className,
      )}
      role="main"
      aria-label="Authentication page"
      style={{
        background: `linear-gradient(135deg, var(--background), rgba(128, 128, 128, 0.05))`,
        backgroundSize: "100% 100%, 100% 100%",
        backgroundRepeat: "repeat, no-repeat",
      }}
    >
      {/* Overlay for stripe pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            repeating-linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.015) 0px,
              rgba(255, 255, 255, 0.015) 3px,
              rgba(255, 255, 255, 0) 200px
            )
          `,
        }}
        aria-hidden="true"
      />

      {/* Content container with proper semantic structure */}
      <div className="relative w-full max-w-md">{children}</div>
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
        "p-8 space-y-3",
        "shadow-lg border-border/50 bg-card/95 backdrop-blur-sm",
        "auth-form-enter", // Animation class
        className,
      )}
    >
      <CardHeader className="text-center space-y-1 transition-colors duration-200 p-0">
        <h3 className="text-3xl font-bold leading-tight tracking-tight text-foreground transition-colors duration-200">
          {title}
        </h3>
        <p className="text-base text-muted-foreground leading-relaxed transition-colors duration-200">
          {description}
        </p>
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}
