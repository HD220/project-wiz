import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, User, Brain, Target, BookOpen } from "lucide-react";
import { useAgents } from "../../agent-management/hooks/use-agents.hook";
import { useLlmProviders } from "../../llm-provider-management/hooks/use-llm-provider.hook";
import type { CreateAgentDto } from "../../../../shared/types/agent.types";

interface AddAgentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  onAgentAdded?: (agent: any) => void;
}

export function AddAgentModal({
  isOpen,
  onOpenChange,
  projectId,
  onAgentAdded,
}: AddAgentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateAgentDto>({
    name: "",
    role: "",
    goal: "",
    backstory: "",
    llmProviderId: "",
    temperature: 0.7,
    maxTokens: 1000,
    isActive: true,
    isDefault: false,
  });

  const { createAgent } = useAgents();
  const { providers, defaultProvider } = useLlmProviders();

  // Set default LLM provider when modal opens
  useEffect(() => {
    if (isOpen && defaultProvider && !formData.llmProviderId) {
      setFormData((prev) => ({ ...prev, llmProviderId: defaultProvider.id }));
    }
  }, [isOpen, defaultProvider, formData.llmProviderId]);

  const handleInputChange = (field: keyof CreateAgentDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Nome é obrigatório");
      return;
    }

    if (!formData.role.trim()) {
      setError("Papel é obrigatório");
      return;
    }

    if (!formData.goal.trim()) {
      setError("Objetivo é obrigatório");
      return;
    }

    if (!formData.backstory.trim()) {
      setError("Background é obrigatório");
      return;
    }

    if (!formData.llmProviderId) {
      setError("Provedor LLM é obrigatório");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newAgent = await createAgent(formData);

      // Reset form
      setFormData({
        name: "",
        role: "",
        goal: "",
        backstory: "",
        llmProviderId: defaultProvider?.id || "",
        temperature: 0.7,
        maxTokens: 1000,
        isActive: true,
        isDefault: false,
      });

      onAgentAdded?.(newAgent);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar agente");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: "",
        role: "",
        goal: "",
        backstory: "",
        llmProviderId: defaultProvider?.id || "",
        temperature: 0.7,
        maxTokens: 1000,
        isActive: true,
        isDefault: false,
      });
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Adicionar Novo Agente
          </DialogTitle>
          <DialogDescription>
            Configure um novo agente de IA para o projeto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ex: João Assistente"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Papel *
              </Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                placeholder="Ex: Desenvolvedor Senior"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <Label htmlFor="goal" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Objetivo *
            </Label>
            <Textarea
              id="goal"
              value={formData.goal}
              onChange={(e) => handleInputChange("goal", e.target.value)}
              placeholder="Descreva o principal objetivo deste agente..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Backstory */}
          <div className="space-y-2">
            <Label htmlFor="backstory" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Background *
            </Label>
            <Textarea
              id="backstory"
              value={formData.backstory}
              onChange={(e) => handleInputChange("backstory", e.target.value)}
              placeholder="Conte a história e experiência deste agente..."
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          {/* LLM Configuration */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="llmProvider">Provedor LLM *</Label>
              <Select
                value={formData.llmProviderId}
                onValueChange={(value) =>
                  handleInputChange("llmProviderId", value)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider: any) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name} {provider.isDefault && "(Padrão)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">
                Temperatura ({formData.temperature})
              </Label>
              <Input
                id="temperature"
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={formData.temperature}
                onChange={(e) =>
                  handleInputChange("temperature", parseFloat(e.target.value))
                }
                disabled={isSubmitting}
              />
              <div className="text-xs text-muted-foreground">
                0 = Preciso, 2 = Criativo
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxTokens">Max Tokens</Label>
              <Input
                id="maxTokens"
                type="number"
                min="100"
                max="10000"
                value={formData.maxTokens}
                onChange={(e) =>
                  handleInputChange(
                    "maxTokens",
                    parseInt(e.target.value) || 1000,
                  )
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Status Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  handleInputChange("isActive", checked)
                }
                disabled={isSubmitting}
              />
              <Label htmlFor="isActive">Agente ativo</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) =>
                  handleInputChange("isDefault", checked)
                }
                disabled={isSubmitting}
              />
              <Label htmlFor="isDefault">Agente padrão</Label>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Criar Agente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
