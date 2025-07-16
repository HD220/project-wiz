import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ApiKeyFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function ApiKeyField({ value, onChange }: ApiKeyFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="apiKey">API Key</Label>
      <Input
        id="apiKey"
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="sk-..."
      />
    </div>
  );
}
