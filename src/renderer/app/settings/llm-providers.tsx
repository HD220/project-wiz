import { useState } from "react";

import { useAuthStore } from "@/renderer/store/auth-store";

import { LlmProviderEditForm } from "@/components/llm-provider-edit-form";
import { LlmProviderForm } from "@/components/llm-provider-form";
import { LlmProviderList } from "@/components/llm-provider-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

export default function LlmProvidersPage() {
  const { user } = useAuthStore();
  const [editingProvider, setEditingProvider] = useState<LlmProvider | null>(
    null,
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditProvider = (provider: LlmProvider) => {
    setEditingProvider(provider);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingProvider(null);
  };

  if (!user) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Authentication Required</h1>
          <p className="text-muted-foreground">
            Please log in to manage your LLM providers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container max-w-4xl py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold">LLM Providers</h1>
            <p className="text-muted-foreground">
              Configure your AI model providers for use with agents
            </p>
          </div>

          {/* Provider Creation Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add Provider</CardTitle>
            </CardHeader>
            <CardContent>
              <LlmProviderForm userId={user.id} />
            </CardContent>
          </Card>

          <Separator />

          {/* Providers List */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Your Providers</h2>
            <LlmProviderList
              userId={user.id}
              onEditProvider={handleEditProvider}
            />
          </div>
        </div>
      </div>

      {/* Edit Provider Dialog */}
      <LlmProviderEditForm
        provider={editingProvider}
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
      />
    </>
  );
}
