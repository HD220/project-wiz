import { ReactNode } from "react";

import { Card, CardContent, CardHeader } from "@/renderer/components/ui/card";
import { cn } from "@/renderer/lib/utils";

interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AuthLayout(props: AuthLayoutProps) {
  const { children, className } = props;

  // Responsive layout for different screen sizes
  const padding = "p-4 lg:p-6"; // Responsive padding
  const alignment = "justify-center lg:justify-center"; // Center alignment

  return (
    <div
      className={cn(
        "min-h-screen w-full",
        "flex items-center",
        alignment,
        padding,
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
              rgba(255, 255, 255, 0.02) 0px,
              rgba(255, 255, 255, 0.02) 3px,
              rgba(255, 255, 255, 0) 200px
            )
          `,
        }}
        aria-hidden="true"
      />

      {/* Content container with responsive width */}
      <div
        className={cn(
          "relative w-full",
          "max-w-sm lg:max-w-md", // Responsive max width
        )}
      >
        {children}
      </div>
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

  // Responsive card configuration
  const padding = "p-6 lg:p-8"; // Responsive padding
  const spacing = "space-y-2 lg:space-y-3"; // Responsive spacing

  return (
    <Card
      className={cn(
        "w-full mx-auto transition-all duration-200 hover:shadow-md",
        padding,
        spacing,
        "shadow-lg border-border/50 bg-card/95 backdrop-blur-sm",
        "auth-form-enter", // Animation class
        className,
      )}
    >
      <CardHeader
        className={cn(
          "text-center transition-colors duration-200 p-0",
          "space-y-0.5 lg:space-y-1", // Responsive header spacing
        )}
      >
        <h3
          className={cn(
            "font-bold leading-tight tracking-tight text-foreground transition-colors duration-200",
            "text-2xl lg:text-3xl", // Responsive title size
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            "text-muted-foreground leading-relaxed transition-colors duration-200",
            "text-sm lg:text-base", // Responsive description size
          )}
        >
          {description}
        </p>
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}
