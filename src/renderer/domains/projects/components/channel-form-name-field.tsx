import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ChannelNameFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function ChannelNameField({ value, onChange }: ChannelNameFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = e.target.value.toLowerCase().replace(/\s+/g, "-");
    onChange(formatted);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="channel-name">Nome do Canal</Label>
      <Input
        id="channel-name"
        placeholder="geral, desenvolvimento, discussoes"
        value={value}
        onChange={handleChange}
        required
      />
    </div>
  );
}