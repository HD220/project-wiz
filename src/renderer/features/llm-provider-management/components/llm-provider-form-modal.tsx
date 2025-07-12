import { useState, useEffect } from "react";
import { useLlmProviders } from "../hooks/use-llm-provider.hook";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LlmProviderDto } from "../../../../shared/types/llm-provider.types";
import { useNavigate } from "@tanstack/react-router";

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
  });

  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name,
        provider: provider.provider,
        model: provider.model,
        apiKey: provider.apiKey,
      });
    } else {
      setFormData({
        name: "",
        provider: "",
        model: "",
        apiKey: "",
      });
    }
  }, [provider]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
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
            <Input id="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Input id="provider" value={formData.provider} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input id="model" value={formData.model} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={formData.apiKey}
              onChange={handleChange}
            />
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
