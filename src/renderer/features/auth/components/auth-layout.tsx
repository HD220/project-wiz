import { ReactNode } from "react";

import { cn } from "@/renderer/lib/utils";

interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

function AuthLayout(props: AuthLayoutProps) {
  const { children, className } = props;

  return (
    <div
      className={cn(
        "min-h-screen w-full bg-gradient-to-br from-background via-muted/30 to-muted/50",
        "flex items-center justify-center",
        "p-[var(--spacing-layout-md)]",
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

export { AuthLayout };
