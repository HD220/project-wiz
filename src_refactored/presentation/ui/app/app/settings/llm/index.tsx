import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { PlusCircle } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";


import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LLMConfigDeleteDialog } from "@/ui/features/llm/components/list/LLMConfigDeleteDialog";
import { NoLLMConfigsDisplay } from "@/ui/features/llm/components/list/NoLLMConfigsDisplay";
import {
  LLMConfigList,
  LLMConfig,
} from "@/ui/features/llm/components/LLMConfigList";

function LLMConfigurationPage() {
  const router = useRouter();

  const [llmConfigs, setLlmConfigs] = useState<LLMConfig[]>([
    {
      id: "1",
      name: "OpenAI Pessoal",
      providerId: "openai",
      baseUrl: "https://api.openai.com/v1",
    },
    {
      id: "2",
      name: "Ollama Local (Llama3)",
      providerId: "ollama",
      baseUrl: "http://localhost:11434",
    },
    { id: "3", name: "DeepSeek Trabalho", providerId: "deepseek" },
  ]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<LLMConfig | null>(
    null,
  );

  const handleEdit = (configId: string) => {
    router.navigate({
      to: "/app/settings/llm/$configId/edit",
      params: { configId },
    });
  };

  const handleDelete = (config: LLMConfig) => {
    setShowDeleteConfirm(config);
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;
    toast.success(
      `Configuração "${showDeleteConfirm.name}" excluída (simulado).`,
    );
    setLlmConfigs((prev) =>
      prev.filter((config) => config.id !== showDeleteConfirm.id),
    );
    setShowDeleteConfirm(null);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-2xl">
              Configurações de Provedor LLM
            </CardTitle>
            <CardDescription>
              Gerencie suas conexões com Modelos de Linguagem (LLMs).
            </CardDescription>
          </div>
          <Button asChild size="sm">
            <Link to="/app/settings/llm/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Configuração
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {llmConfigs.length === 0 ? (
            <NoLLMConfigsDisplay />
          ) : (
            <LLMConfigList
              configs={llmConfigs}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      {showDeleteConfirm && (
        <LLMConfigDeleteDialog
          showDeleteConfirm={showDeleteConfirm}
          setShowDeleteConfirm={setShowDeleteConfirm}
          confirmDelete={confirmDelete}
        />
      )}
    </div>
  );
}

export const Route = createFileRoute("/app/settings/llm/")({
  component: LLMConfigurationPage,
});

