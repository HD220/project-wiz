import { ChannelDescField } from "./channel-form-desc-field";
import { ChannelNameField } from "./channel-form-name-field";

interface ChannelFormFieldsProps {
  channelName: string;
  channelDescription: string;
  onFieldChange: (field: string, value: string) => void;
}

export function ChannelFormFields({
  channelName,
  channelDescription,
  onFieldChange,
}: ChannelFormFieldsProps) {
  return (
    <>
      <ChannelNameField
        value={channelName}
        onChange={(value) => onFieldChange("channelName", value)}
      />

      <ChannelDescField
        value={channelDescription}
        onChange={(value) => onFieldChange("channelDescription", value)}
      />
    </>
  );
}
