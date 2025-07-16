import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface ProviderFieldProps {
  value: string;
  onChange: (value: string, models: string[]) => void;
}

export function ProviderField({ value, onChange }: ProviderFieldProps) {
  const handleChange = (selectedValue: string) => {
    const providerConfig = SUPPORTED_PROVIDERS.find(
      (p) => p.value === selectedValue,
    );
    onChange(selectedValue, providerConfig?.models || []);
  };

  return (
    <div className="space-y-2">
      <Label>Provider</Label>
      <Select value={value} onValueChange={handleChange}>
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
  );
}
