import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { LlmProviderDto } from "../../../../shared/types/llm-provider.types";
import { useLlmProviders } from "../hooks/use-llm-provider.hook";

const SUPPORTED_PROVIDERS = [
  {
    value: "openai",
    label: "OpenAI",
    models: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
  },
  {
    value: "deepseek",
    label: "DeepSeek",
    models: ["deepseek-chat", "deepseek-coder"],
  },
  { value: "custom", label: "Custom Provider", models: [] },
];

interface LlmProviderFormModalProps {
  provider: LlmProviderDto | null;
  onClose: () => void;
  isOpen: boolean;
}

export function LlmProviderFormModal({
  provider,
  onClose,
  isOpen,
}: LlmProviderFormModalProps) {
  const { createLlmProvider, updateLlmProvider } = useLlmProviders();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    provider: "",
    model: "",
    apiKey: "",
    isDefault: false,
  });
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name,
        provider: provider.provider,
        model: provider.model,
        apiKey: provider.apiKey,
        isDefault: provider.isDefault,
      });
      setSelectedProvider(provider.provider);
      const providerConfig = SUPPORTED_PROVIDERS.find(
        (p) => p.value === provider.provider,
      );
      setAvailableModels(providerConfig?.models || []);
    } else {
      setFormData({
        name: "",
        provider: "",
        model: "",
        apiKey: "",
        isDefault: false,
      });
      setSelectedProvider("");
      setAvailableModels([]);
    }
  }, [provider]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleProviderChange = (value: string) => {
    setSelectedProvider(value);
    setFormData((prev) => ({ ...prev, provider: value, model: "" }));

    const providerConfig = SUPPORTED_PROVIDERS.find((p) => p.value === value);
    setAvailableModels(providerConfig?.models || []);
  };

  const handleModelChange = (value: string) => {
    setFormData((prev) => ({ ...prev, model: value }));
  };

  const handleSubmit = async () => {
    if (provider) {
      await updateLlmProvider({ id: provider.id, ...formData });
    } else {
      await createLlmProvider(formData);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{provider ? "Edit" : "Add"} LLM Provider</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="My AI Provider"
            />
          </div>

          <div className="space-y-2">
            <Label>Provider</Label>
            <Select
              value={selectedProvider}
              onValueChange={handleProviderChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_PROVIDERS.map((provider) => (
                  <SelectItem key={provider.value} value={provider.value}>
                    {provider.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Model</Label>
            {availableModels.length > 0 ? (
              <Select value={formData.model} onValueChange={handleModelChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Enter custom model name"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={formData.apiKey}
              onChange={handleChange}
              placeholder="sk-..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  isDefault: checked as boolean,
                }))
              }
            />
            <Label htmlFor="isDefault" className="text-sm font-normal">
              Definir como provedor padrão
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
