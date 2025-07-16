import { ChannelDescField } from "./channel-form-desc-field";
import { ChannelNameField } from "./channel-form-name-field";
import { ChannelPrivacyField } from "./channel-form-privacy-field";
import { ChannelTypeField } from "./channel-form-type-field";

interface ChannelFormFieldsProps {
  channelName: string;
  channelDescription: string;
  channelType: "general" | "task" | "agent";
  isPrivate: boolean;
  onFieldChange: (field: string, value: string | boolean) => void;
}

export function ChannelFormFields({
  channelName,
  channelDescription,
  channelType,
  isPrivate,
  onFieldChange,
}: ChannelFormFieldsProps) {
  return (
    <>
      <ChannelTypeField
        value={channelType}
        onChange={(value) => onFieldChange("channelType", value)}
      />

      <ChannelNameField
        value={channelName}
        onChange={(value) => onFieldChange("channelName", value)}
      />

      <ChannelDescField
        value={channelDescription}
        onChange={(value) => onFieldChange("channelDescription", value)}
      />

      <ChannelPrivacyField
        value={isPrivate}
        onChange={(value) => onFieldChange("isPrivate", value)}
      />
    </>
  );
}
