interface ChannelFormData {
  channelName: string;
  channelDescription: string;
  isPrivate: boolean;
  setIsSubmitting: (value: boolean) => void;
}

interface CreateChannelData {
  name: string;
  description?: string;
  isPrivate: boolean;
  createdBy: string;
}

interface ChannelCreator {
  createChannel: (data: CreateChannelData) => Promise<void>;
  clearError: () => void;
}

export function useChannelFormSubmit(
  formData: ChannelFormData,
  channelCreator: ChannelCreator,
) {
  const validateForm = (): boolean => {
    return !!formData.channelName.trim();
  };

  const handleSubmit = async (event: React.FormEvent): Promise<boolean> => {
    event.preventDefault();

    if (!validateForm()) {
      return false;
    }

    formData.setIsSubmitting(true);
    channelCreator.clearError();

    try {
      await channelCreator.createChannel({
        name: formData.channelName.trim(),
        description: formData.channelDescription.trim() || undefined,
        isPrivate: formData.isPrivate,
        createdBy: "current-user",
      });
      return true;
    } catch (error) {
      console.error("Error creating channel:", error);
      return false;
    } finally {
      formData.setIsSubmitting(false);
    }
  };

  return { handleSubmit };
}
