import { Brain, Loader2 } from "lucide-react";

import {
  TextField,
  TextAreaField,
  NumberField,
  SelectField,
} from "@/components/forms/form-fields";
import { fieldTransformers } from "@/components/forms/field-transformers";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { CreateAgentDto } from "@/shared/types/domains/agents/agent.types";
import type { LlmProviderDto } from "@/shared/types/domains/llm/llm-provider.types";

interface FormFieldProps {
  formData: CreateAgentDto;
  updateField: <K extends keyof CreateAgentDto>(
    field: K,
    value: CreateAgentDto[K],
  ) => void;
}

// Campos Básicos
export function AddAgentNameField({ formData, updateField }: FormFieldProps) {
  return (
    <TextField
      id="name"
      label="Nome do Agente"
      value={formData.name}
      onChange={(value) => updateField("name", value)}
      placeholder="ex: Analista de Código"
      transformer={fieldTransformers.normalizeText}
      required
    />
  );
}

export function AddAgentRoleField({ formData, updateField }: FormFieldProps) {
  return (
    <TextField
      id="role"
      label="Função/Especialidade"
      value={formData.role}
      onChange={(value) => updateField("role", value)}
      placeholder="ex: Senior Python Developer"
      icon={Brain}
      required
    />
  );
}

export function AddAgentGoalField({ formData, updateField }: FormFieldProps) {
  return (
    <TextAreaField
      id="goal"
      label="Objetivo Principal"
      value={formData.goal}
      onChange={(value) => updateField("goal", value)}
      placeholder="Descreva o objetivo principal deste agente..."
      rows={3}
      required
    />
  );
}

export function AddAgentBackstoryField({
  formData,
  updateField,
}: FormFieldProps) {
  return (
    <TextAreaField
      id="backstory"
      label="Histórico/Contexto"
      value={formData.backstory}
      onChange={(value) => updateField("backstory", value)}
      placeholder="Forneça contexto sobre a experiência e conhecimento do agente..."
      rows={4}
    />
  );
}

interface LlmProviderFieldProps extends FormFieldProps {
  llmProviders: LlmProviderDto[];
}

export function AddAgentLlmProviderField({
  formData,
  updateField,
  llmProviders,
}: LlmProviderFieldProps) {
  return (
    <SelectField
      id="llmProviderId"
      label="Provedor LLM"
      value={formData.llmProviderId}
      onChange={(value) => updateField("llmProviderId", value)}
      placeholder="Selecione um provedor..."
      options={llmProviders.map((provider) => ({
        value: provider.id,
        label: `${provider.name} (${provider.model})`,
      }))}
      required
    />
  );
}

// Campos Avançados
export function AddAgentTemperatureField({
  formData,
  updateField,
}: FormFieldProps) {
  return (
    <NumberField
      id="temperature"
      label="Temperatura"
      value={formData.temperature}
      onChange={(value) => updateField("temperature", value)}
      min={0}
      max={2}
      step={0.1}
      required
    />
  );
}

export function AddAgentTokensField({ formData, updateField }: FormFieldProps) {
  return (
    <NumberField
      id="maxTokens"
      label="Tokens Máximos"
      value={formData.maxTokens}
      onChange={(value) => updateField("maxTokens", value)}
      min={100}
      max={4000}
      step={100}
      required
    />
  );
}

export function AddAgentIterationsField({
  formData,
  updateField,
}: FormFieldProps) {
  return (
    <NumberField
      id="maxIterations"
      label="Iterações Máximas"
      value={formData.maxIterations}
      onChange={(value) => updateField("maxIterations", value)}
      min={1}
      max={10}
      step={1}
      required
    />
  );
}

export function AddAgentSystemPromptField({
  formData,
  updateField,
}: FormFieldProps) {
  return (
    <TextAreaField
      id="systemPrompt"
      label="Prompt do Sistema"
      value={formData.systemPrompt}
      onChange={(value) => updateField("systemPrompt", value)}
      placeholder="Instruções específicas para o comportamento do agente..."
      rows={6}
    />
  );
}

export function AddAgentOptionsFields({
  formData,
  updateField,
}: FormFieldProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => updateField("isActive", e.target.checked)}
          className="h-4 w-4"
        />
        <label htmlFor="isActive" className="text-sm font-medium">
          Ativo
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isDefault"
          checked={formData.isDefault}
          onChange={(e) => updateField("isDefault", e.target.checked)}
          className="h-4 w-4"
        />
        <label htmlFor="isDefault" className="text-sm font-medium">
          Padrão
        </label>
      </div>
    </div>
  );
}

// Grupos de Campos
export function AddAgentBasicFields({
  formData,
  updateField,
  llmProviders,
}: LlmProviderFieldProps) {
  return (
    <div className="space-y-4">
      <AddAgentNameField formData={formData} updateField={updateField} />
      <AddAgentRoleField formData={formData} updateField={updateField} />
      <AddAgentGoalField formData={formData} updateField={updateField} />
      <AddAgentBackstoryField formData={formData} updateField={updateField} />
      <AddAgentLlmProviderField
        formData={formData}
        updateField={updateField}
        llmProviders={llmProviders}
      />
    </div>
  );
}

export function AddAgentAdvancedFields({
  formData,
  updateField,
}: FormFieldProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <AddAgentTemperatureField
          formData={formData}
          updateField={updateField}
        />
        <AddAgentTokensField formData={formData} updateField={updateField} />
      </div>

      <AddAgentIterationsField formData={formData} updateField={updateField} />
      <AddAgentSystemPromptField
        formData={formData}
        updateField={updateField}
      />
      <AddAgentOptionsFields formData={formData} updateField={updateField} />
    </div>
  );
}

// Formulário com Tabs
export function AddAgentFormTabs({
  formData,
  updateField,
  llmProviders,
}: LlmProviderFieldProps) {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
        <TabsTrigger value="advanced">Configurações Avançadas</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4 mt-4">
        <AddAgentBasicFields
          formData={formData}
          updateField={updateField}
          llmProviders={llmProviders}
        />
      </TabsContent>

      <TabsContent value="advanced" className="space-y-4 mt-4">
        <AddAgentAdvancedFields formData={formData} updateField={updateField} />
      </TabsContent>
    </Tabs>
  );
}

// Ações do Formulário
interface AddAgentFormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

export function AddAgentFormActions({
  isSubmitting,
  onCancel,
}: AddAgentFormActionsProps) {
  return (
    <DialogFooter className="mt-6">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Criar Agente
      </Button>
    </DialogFooter>
  );
}

// Erro do Formulário
interface AddAgentFormErrorProps {
  error: string | null;
}

export function AddAgentFormError({ error }: AddAgentFormErrorProps) {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
      <p className="text-sm text-red-600">{error}</p>
    </div>
  );
}

// Header do Modal
interface AddAgentModalHeaderProps {
  title?: string;
  description?: string;
}

export function AddAgentModalHeader({
  title = "Criar Novo Agente",
  description = "Configure um novo agente para seu projeto",
}: AddAgentModalHeaderProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
