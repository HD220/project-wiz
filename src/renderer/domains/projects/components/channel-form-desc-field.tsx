import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ChannelDescFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function ChannelDescField({ value, onChange }: ChannelDescFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="channel-description">Descrição (Opcional)</Label>
      <Textarea
        id="channel-description"
        placeholder="Para que serve este canal..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
      />
    </div>
  );
}
