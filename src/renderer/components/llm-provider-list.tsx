import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

import { useLlmProviderStore } from "@/renderer/store/llm-provider-store";

import { EmptyProviderState } from "@/components/empty-provider-state";
import { LlmProviderCard } from "@/components/llm-provider-card";
import { ProviderListSkeleton } from "@/components/provider-list-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Local type definition to match the store
interface LlmProvider {
  id: string;
  userId: string;
  name: string;
  type: "openai" | "deepseek" | "anthropic";
  apiKey: string;
  baseUrl: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface LlmProviderListProps {
  userId: string;
}

export function LlmProviderList({ userId }: LlmProviderListProps) {
  const { providers, isLoading, error, loadProviders, clearError } =
    useLlmProviderStore();

  // Load providers on mount
  useEffect(() => {
    if (userId) {
      loadProviders(userId);
    }
  }, [userId, loadProviders]);

  // Loading state
  if (isLoading) {
    return <ProviderListSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (providers.length === 0) {
    return <EmptyProviderState />;
  }

  // List rendering
  return (
    <div className="space-y-4">
      {providers.map((provider: LlmProvider) => (
        <LlmProviderCard key={provider.id} provider={provider} />
      ))}
    </div>
  );
}
