import { Label } from "@/components/ui/label";

interface ChannelPrivacyFieldProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ChannelPrivacyField({ value, onChange }: ChannelPrivacyFieldProps) {
  return (
    <div className="flex items-center space-x-2">
      <input
        id="channel-private"
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-input"
      />
      <Label htmlFor="channel-private" className="text-sm font-normal">
        Canal Privado
      </Label>
    </div>
  );
}