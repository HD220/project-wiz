import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";

interface ProjectListErrorProps {
  error: string;
  onRetry: () => void;
}

export function ProjectListError({ error, onRetry }: ProjectListErrorProps) {
  return (
    <Alert variant="destructive">
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      </AlertDescription>
    </Alert>
  );
}