import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

// Local type definitions to avoid boundary violations
type ProviderType = "openai" | "deepseek" | "anthropic";

interface SelectLlmProvider {
  id: string;
  userId: string;
  name: string;
  type: ProviderType;
  apiKey: string;
  baseUrl: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

import { LlmProviderForm } from "@/renderer/components/llm-provider-form";
import { Alert, AlertDescription } from "@/renderer/components/ui/alert";
import { Badge } from "@/renderer/components/ui/badge";
import { Button } from "@/renderer/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
import { useLlmProviderStore } from "@/renderer/store/llm-provider-store";

export const Route = createFileRoute("/")({
  component: function Index() {
    const {
      providers,
      isLoading,
      error,
      loadProviders,
      deleteProvider,
      setAsDefault,
      clearError,
    } = useLlmProviderStore();

    const [showForm, setShowForm] = useState(false);

    // Mock user ID - in a real app, this would come from auth context
    const userId = "demo-user-id";

    useEffect(() => {
      loadProviders(userId);
    }, [loadProviders, userId]);

    const handleDeleteProvider = async (id: string) => {
      if (confirm("Are you sure you want to delete this provider?")) {
        try {
          await deleteProvider(id);
        } catch (_error) {
          // Error is handled by the store
        }
      }
    };

    const handleSetDefault = async (providerId: string) => {
      try {
        await setAsDefault(providerId, userId);
      } catch (_error) {
        // Error is handled by the store
      }
    };

    const handleFormSuccess = () => {
      setShowForm(false);
      clearError();
    };

    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Project Wiz</h1>
            <p className="text-muted-foreground">
              LLM Provider Management - MVP Implementation
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add Provider"}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showForm && (
          <Card>
            <CardContent className="pt-6">
              <LlmProviderForm userId={userId} onSuccess={handleFormSuccess} />
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Providers</h2>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading providers...</p>
            </div>
          ) : providers.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">
                  No LLM providers configured yet.
                </p>
                <Button onClick={() => setShowForm(true)}>
                  Add Your First Provider
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {providers.map((provider: SelectLlmProvider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onDelete={handleDeleteProvider}
                  onSetDefault={handleSetDefault}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  },
});

interface ProviderCardProps {
  provider: SelectLlmProvider;
  onDelete: (id: string) => void;
  onSetDefault: (providerId: string) => void;
}

function ProviderCard({ provider, onDelete, onSetDefault }: ProviderCardProps) {
  const getProviderDisplayName = (type: string) => {
    switch (type) {
      case "openai":
        return "OpenAI";
      case "deepseek":
        return "DeepSeek";
      case "anthropic":
        return "Anthropic";
      default:
        return type;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {provider.name}
              {provider.isDefault && <Badge variant="default">Default</Badge>}
              {!provider.isActive && (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </CardTitle>
            <CardDescription>
              {getProviderDisplayName(provider.type)}
              {provider.baseUrl && ` • Custom endpoint: ${provider.baseUrl}`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {!provider.isDefault && provider.isActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSetDefault(provider.id)}
              >
                Set as Default
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(provider.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          <p>Created: {new Date(provider.createdAt).toLocaleDateString()}</p>
          {provider.updatedAt !== provider.createdAt && (
            <p>Updated: {new Date(provider.updatedAt).toLocaleDateString()}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
