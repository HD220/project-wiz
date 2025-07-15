import { useState } from "react";

import { useProjectChannels } from "./use-project-channels.hook";

export function useChannelForm(projectId: string) {
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [channelType, setChannelType] = useState<"general" | "task" | "agent">(
    "general",
  );
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createChannel, error, clearError } = useProjectChannels(projectId);

  const handleFieldChange = (field: string, value: string | boolean) => {
    switch (field) {
      case "channelName":
        setChannelName(value as string);
        break;
      case "channelDescription":
        setChannelDescription(value as string);
        break;
      case "channelType":
        setChannelType(value as "general" | "task" | "agent");
        break;
      case "isPrivate":
        setIsPrivate(value as boolean);
        break;
    }
  };

  const resetForm = () => {
    setChannelName("");
    setChannelDescription("");
    setChannelType("general");
    setIsPrivate(false);
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!channelName.trim()) {
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      await createChannel({
        name: channelName.trim(),
        description: channelDescription.trim() || undefined,
        isPrivate,
        createdBy: "current-user",
      });
      return true;
    } catch (error) {
      console.error("Error creating channel:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    channelName,
    channelDescription,
    channelType,
    isPrivate,
    isSubmitting,
    error,
    handleFieldChange,
    handleSubmit,
    resetForm,
  };
}
