import React from "react";
import { toast } from "sonner";

import {
  LLMConfigForm,
  LLMConfigFormData,
} from "@/ui/features/llm/components/LLMConfigForm";

interface InitialConfigStepProps {
  onConfigSaved: (data: LLMConfigFormData) => void;
  // Callback when LLM config is successfully "saved"
  isSubmitting?: boolean;
  // Optional: if parent controls submission state
  setIsSubmitting?: (isSubmitting: boolean) => void;
  // Optional: to let this component control parent's state
}

export function InitialConfigStep({
  onConfigSaved,
  isSubmitting: parentIsSubmitting,
  setIsSubmitting: parentSetIsSubmitting,
}: InitialConfigStepProps) {
  // Use local submitting state if parent doesn't provide one
  const [internalIsSubmitting, internalSetIsSubmitting] = React.useState(false);
  const isSubmitting = parentIsSubmitting ?? internalIsSubmitting;
  const setIsSubmitting = parentSetIsSubmitting ?? internalSetIsSubmitting;

  const handleSubmit = async (data: LLMConfigFormData) => {
    setIsSubmitting(true);
    console.log("LLM Config data from Onboarding:", data);

    // Simulate saving the LLM configuration
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // In a real app, you'd call an IPC handler here.
    // For now, we assume success and call the callback.

    // Important: Add the new config to the mock DB or a global store if other parts of the app need it immediately
    // For example, if mockLlmConfigsDb is accessible (e.g. via a Zustand store or by passing it down):
    // const newConfigId = `config-${Date.now()}`;
    // mockLlmConfigsDb[newConfigId] = { ...data, id: newConfigId };

    toast.success(
      `Configuração LLM "${data.name}" salva com sucesso (simulado)!`
    );
    // Notify parent that config is "saved"
    onConfigSaved(data);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-1">
          Configuração Inicial Essencial
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Para que os Agentes IA do Project Wiz funcionem, eles precisam de
          acesso a um Provedor de Modelo de Linguagem (LLM). Por favor,
          configure seu primeiro provedor.
        </p>
      </div>
      <LLMConfigForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitButtonText="Salvar Configuração LLM e Continuar"
      />
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 text-center">
        Você poderá adicionar mais provedores ou modificar esta configuração
        posteriormente na seção de &quot;Configurações&quot; da aplicação.
      </p>
    </div>
  );
}
