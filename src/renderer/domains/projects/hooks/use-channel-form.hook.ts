import { useChannelFormState } from "./use-channel-form-state.hook";
import { useChannelFormSubmit } from "./use-channel-form-submit.hook";
import { useProjectChannels } from "./use-project-channels.hook";

export function useChannelForm(projectId: string) {
  const { createChannel, error, clearError } = useProjectChannels(projectId);
  const formState = useChannelFormState();
  const { handleSubmit } = useChannelFormSubmit(
    {
      channelName: formState.channelName,
      channelDescription: formState.channelDescription,
      isPrivate: formState.isPrivate,
      setIsSubmitting: formState.setIsSubmitting,
    },
    { createChannel, clearError },
  );

  const resetForm = () => {
    formState.resetForm();
    clearError();
  };

  return {
    channelName: formState.channelName,
    channelDescription: formState.channelDescription,
    channelType: formState.channelType,
    isPrivate: formState.isPrivate,
    isSubmitting: formState.isSubmitting,
    error,
    handleFieldChange: formState.handleFieldChange,
    handleSubmit,
    resetForm,
  };
}
