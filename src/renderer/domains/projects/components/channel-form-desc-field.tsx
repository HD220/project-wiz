import { TextAreaField } from "@/components/forms/form-fields";

interface ChannelDescFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function ChannelDescField({ value, onChange }: ChannelDescFieldProps) {
  return (
    <TextAreaField
      id="channel-description"
      label="Descrição (Opcional)"
      value={value}
      onChange={onChange}
      placeholder="Para que serve este canal..."
      rows={3}
    />
  );
}
