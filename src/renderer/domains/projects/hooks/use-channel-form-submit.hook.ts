interface ChannelFormData {
  channelName: string;
  channelDescription: string;
  isPrivate: boolean;
  setIsSubmitting: (value: boolean) => void;
}

interface ChannelCreator {
  createChannel: (data: any) => Promise<void>;
  clearError: () => void;
}

export function useChannelFormSubmit(
  formData: ChannelFormData,
  channelCreator: ChannelCreator,
) {
  const validateForm = (): boolean => {
    return !!formData.channelName.trim();
  };

  const handleSubmit = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();

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
