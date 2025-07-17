import { TextField } from "@/components/forms/form-fields";
import { fieldTransformers } from "@/components/forms/field-transformers";

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
      transformer={fieldTransformers.channelName}
      required
    />
  );
}
