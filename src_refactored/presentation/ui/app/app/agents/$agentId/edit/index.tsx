import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataLoadingOrErrorDisplay } from "@/ui/components/DataLoadingOrErrorDisplay";
import { useAgentInstanceData } from "@/ui/hooks/useAgentInstanceData";
import { useUpdateAgentInstance } from "@/ui/hooks/useUpdateAgentInstance";

import { EditAgentFormRenderer } from "./EditAgentFormRenderer";

function EditAgentInstancePage() {
  const router = useRouter();
  const { agentId, agentInstance, personaTemplates, llmConfigs, isLoadingAll, anyError, agentError, personasError, llmsError, refetchAgent } = useAgentInstanceData();

  const { handleSubmit, isSubmitting } = useUpdateAgentInstance({
    agentId,
    refetchAgent,
  });

  const loadingOrErrorDisplay = DataLoadingOrErrorDisplay({
    isLoadingAll,
    anyError,
    agentError,
    personasError,
    llmsError,
    router,
  });

  if (loadingOrErrorDisplay) {
    return loadingOrErrorDisplay;
  }

  if (!agentInstance) {
    return (
      <div className="p-8 text-center">
        <p>Instância de Agente com ID &quot;{agentId}&quot; não encontrada.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/agents">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista de Agentes
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <EditAgentFormRenderer
      agentId={agentId}
      agentInstance={agentInstance}
      personaTemplates={personaTemplates}
      llmConfigs={llmConfigs}
      handleSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}

export const Route = createFileRoute("/app/agents/$agentId/edit/")({
  component: EditAgentInstancePage,
});
