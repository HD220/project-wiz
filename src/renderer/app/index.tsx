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

import { AgentForm } from "@/renderer/components/agent-form";
import { AgentList } from "@/renderer/components/agent-list";
import { AuthButton } from "@/renderer/components/auth-button";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/renderer/components/ui/tabs";
import { useAgentStore } from "@/renderer/store/agent-store";
import { useAuthStore } from "@/renderer/store/auth-store";
import { useLlmProviderStore } from "@/renderer/store/llm-provider-store";

export const Route = createFileRoute("/")({
  component: function Index() {
    const {
      providers,
      isLoading: providersLoading,
      error: providersError,
      loadProviders,
      deleteProvider,
      setAsDefault,
      clearError: clearProvidersError,
    } = useLlmProviderStore();

    const {
      agents,
      error: agentsError,
      loadAgents,
      clearError: clearAgentsError,
    } = useAgentStore();

    const { user, getCurrentUser } = useAuthStore();

    const [showProviderForm, setShowProviderForm] = useState(false);
    const [showAgentForm, setShowAgentForm] = useState(false);

    // Get user ID from authenticated user, fallback to demo for testing
    const userId = user?.id || "demo-user-id";

    useEffect(() => {
      // Initialize auth state on app load
      getCurrentUser();
    }, [getCurrentUser]);

    useEffect(() => {
      // Load data when user changes
      if (userId) {
        loadProviders(userId);
        loadAgents();
      }
    }, [loadProviders, loadAgents, userId]);

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

    const handleProviderFormSuccess = () => {
      setShowProviderForm(false);
      clearProvidersError();
    };

    const handleAgentFormSuccess = () => {
      setShowAgentForm(false);
      clearAgentsError();
    };

    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Project Wiz</h1>
            <p className="text-muted-foreground">
              AI Agent Management System - MVP Implementation
            </p>
          </div>
          <AuthButton />
        </div>

        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="agents">
              AI Agents ({agents.length})
            </TabsTrigger>
            <TabsTrigger value="providers">
              LLM Providers ({providers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">AI Agents</h2>
                <p className="text-muted-foreground">
                  Create and manage AI agents for your projects
                </p>
              </div>
              <Button onClick={() => setShowAgentForm(!showAgentForm)}>
                {showAgentForm ? "Cancel" : "Create Agent"}
              </Button>
            </div>

            {agentsError && (
              <Alert variant="destructive">
                <AlertDescription>{agentsError}</AlertDescription>
              </Alert>
            )}

            {showAgentForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Agent</CardTitle>
                </CardHeader>
                <CardContent>
                  <AgentForm
                    userId={userId}
                    onSuccess={handleAgentFormSuccess}
                  />
                </CardContent>
              </Card>
            )}

            <AgentList userId={userId} />
          </TabsContent>

          <TabsContent value="providers" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">LLM Providers</h2>
                <p className="text-muted-foreground">
                  Configure your AI model providers
                </p>
              </div>
              <Button onClick={() => setShowProviderForm(!showProviderForm)}>
                {showProviderForm ? "Cancel" : "Add Provider"}
              </Button>
            </div>

            {providersError && (
              <Alert variant="destructive">
                <AlertDescription>{providersError}</AlertDescription>
              </Alert>
            )}

            {showProviderForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Provider</CardTitle>
                </CardHeader>
                <CardContent>
                  <LlmProviderForm
                    userId={userId}
                    onSuccess={handleProviderFormSuccess}
                  />
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {providersLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading providers...</p>
                </div>
              ) : providers.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground mb-4">
                      No LLM providers configured yet.
                    </p>
                    <Button onClick={() => setShowProviderForm(true)}>
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
          </TabsContent>
        </Tabs>
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
          <p>Created: {provider.createdAt instanceof Date ? provider.createdAt.toLocaleDateString() : new Date(provider.createdAt).toLocaleDateString()}</p>
          {provider.updatedAt instanceof Date && provider.createdAt instanceof Date && 
           provider.updatedAt.getTime() !== provider.createdAt.getTime() && (
            <p>Updated: {provider.updatedAt.toLocaleDateString()}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
