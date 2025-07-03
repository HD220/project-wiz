import { createFileRoute, useRouter } from "@tanstack/react-router";
import React from "react";

import { NewAgentFormRenderer } from "@/ui/features/agent/components/NewAgentFormRenderer";
import { NewAgentLoadingErrorDisplay } from "@/ui/features/agent/components/NewAgentLoadingErrorDisplay";
import { useCreateAgentInstance } from "@/ui/hooks/useCreateAgentInstance";
import { useNewAgentInstanceData } from "@/ui/hooks/useNewAgentInstanceData";



function NewAgentInstancePage() {
  const router = useRouter();

  const { personaTemplates, llmConfigs, isLoadingDependencies, dependencyError, personasError, llmConfigsError } = useNewAgentInstanceData();
  const { handleSubmit, isSubmitting } = useCreateAgentInstance();

  const loadingErrorDisplay = NewAgentLoadingErrorDisplay({
    isLoadingDependencies,
    dependencyError,
    personasError,
    llmConfigsError,
  });

  if (loadingErrorDisplay) {
    return loadingErrorDisplay;
  }

  const handleCancel = () => {
    router.history.back();
  };

  return (
    <NewAgentFormRenderer
      personaTemplates={personaTemplates}
      llmConfigs={llmConfigs}
      handleSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      onCancel={handleCancel}
    />
  );
}

export const Route = createFileRoute("/app/agents/new/")({
  component: NewAgentInstancePage,
});
