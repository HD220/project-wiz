import { Plus } from "lucide-react";
import { useState } from "react";

import type { LlmProvider } from "@/main/features/agent/llm-provider/llm-provider.types";

import { Button } from "@/renderer/components/ui/button";
import { useLLMProvidersStore } from "@/renderer/store/llm-provider.store";

import { EmptyState } from "./empty-state";
import { ProviderCard } from "./provider-card";
import { ProviderForm } from "./provider-form";

function ProviderList() {
  const [showForm, setShowForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<LlmProvider | null>(
    null,
  );

  const { providers, isLoading } = useLLMProvidersStore();

  const handleEdit = (provider: LlmProvider) => {
    setEditingProvider(provider);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProvider(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (providers.length === 0 && !showForm) {
    return <EmptyState onAddProvider={() => setShowForm(true)} />;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">Configured Providers</h3>
              {providers.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({providers.length})
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Manage your AI language model providers
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Add Provider
          </Button>
        </div>

        {/* Providers List */}
        <div className="space-y-2">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onEdit={handleEdit}
            />
          ))}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <ProviderForm provider={editingProvider} onClose={handleCloseForm} />
      )}
    </>
  );
}

export { ProviderList };
