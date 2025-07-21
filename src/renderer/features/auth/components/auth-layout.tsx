import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className={cn("h-full bg-muted flex items-center justify-center p-4", className)}>
      {children}
    </div>
  );
}