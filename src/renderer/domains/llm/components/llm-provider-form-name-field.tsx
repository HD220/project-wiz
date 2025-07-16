import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProviderNameFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProviderNameField({ value, onChange }: ProviderNameFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="name">Name</Label>
      <Input
        id="name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="My AI Provider"
      />
    </div>
  );
}
