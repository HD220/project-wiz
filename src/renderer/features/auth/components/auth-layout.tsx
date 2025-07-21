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
        "h-full bg-muted flex items-center justify-center p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { AuthLayout };
