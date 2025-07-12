import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AsyncBoundaryProps {
  isLoading: boolean;
  error: Error | null;
  children: ReactNode;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
}

export function AsyncBoundary({
  isLoading,
  error,
  children,
  loadingComponent,
  errorComponent,
}: AsyncBoundaryProps) {
  if (isLoading) {
    return (
      loadingComponent || (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      )
    );
  }

  if (error) {
    return (
      errorComponent || (
        <Alert variant="destructive">
          <AlertDescription>Error: {error.message}</AlertDescription>
        </Alert>
      )
    );
  }

  return <>{children}</>;
}
