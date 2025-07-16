import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useLlmProviders } from "@/domains/llm/hooks/use-llm-provider.hook";

interface AiChatProviderSelectorProps {
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
}

export function AiChatProviderSelector({
  selectedProvider,
  onProviderChange,
}: AiChatProviderSelectorProps) {
  const { providers, isLoading } = useLlmProviders();

  if (isLoading) {
    return <div>Loading providers...</div>;
  }

  return (
    <Select value={selectedProvider} onValueChange={onProviderChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione um provedor LLM" />
      </SelectTrigger>
      <SelectContent>
        {providers.map((provider) => (
          <SelectItem key={provider.id} value={provider.id}>
            {provider.name} ({provider.type})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
