import { useState } from "react";

export function useChannelFormState() {
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [channelType, setChannelType] = useState<"general" | "task" | "agent">("general");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setChannelName("");
    setChannelDescription("");
    setChannelType("general");
    setIsPrivate(false);
  };

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

  return {
    channelName,
    channelDescription,
    channelType,
    isPrivate,
    isSubmitting,
    setIsSubmitting,
    handleFieldChange,
    resetForm,
  };
}