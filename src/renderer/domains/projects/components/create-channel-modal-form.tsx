import { ChannelFormFields } from "./channel-form-fields";
import { CreateChannelModalFooter } from "./create-channel-modal-footer";

interface CreateChannelModalFormProps {
  channelName: string;
  channelDescription: string;
  channelType: string;
  isPrivate: boolean;
  isSubmitting: boolean;
  error: string | null;
  onFieldChange: (field: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
}

export function CreateChannelModalForm({
  channelName,
  channelDescription,
  channelType,
  isPrivate,
  isSubmitting,
  error,
  onFieldChange,
  onSubmit,
  onCancel,
}: CreateChannelModalFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ChannelFormFields
        channelName={channelName}
        channelDescription={channelDescription}
        channelType={channelType}
        isPrivate={isPrivate}
        onFieldChange={onFieldChange}
      />

      {error && <div className="text-sm text-destructive">{error}</div>}

      <CreateChannelModalFooter
        channelName={channelName}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
      />
    </form>
  );
}
