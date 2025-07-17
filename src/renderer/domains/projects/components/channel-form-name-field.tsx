import { TextField } from "@/components/forms/form-fields";
import { FieldUtils } from "@/lib/field-utils";

interface ChannelNameFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function ChannelNameField({ value, onChange }: ChannelNameFieldProps) {
  return (
    <TextField
      id="channel-name"
      label="Nome do Canal"
      value={value}
      onChange={onChange}
      placeholder="geral, desenvolvimento, discussoes"
      transformer={FieldUtils.transformers.channelName}
      required
    />
  );
}
