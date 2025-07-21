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
        {/* Add Provider Button */}
        <div className="flex justify-end">
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Provider
          </Button>
        </div>

        {/* Providers Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
