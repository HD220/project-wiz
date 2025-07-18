import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

import { Alert, AlertDescription } from "../../../../components/ui/alert";

interface AiChatStatusProps {
  isLoading?: boolean;
  error?: string | null;
  success?: string | null;
}

export function AiChatStatus({ isLoading, error, success }: AiChatStatusProps) {
  if (isLoading) {
    return (
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>Processando mensagem...</AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (success) {
    return (
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>{success}</AlertDescription>
      </Alert>
    );
  }

  return null;
}
