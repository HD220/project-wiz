import { useState } from "react";

export function useChannelFormState() {
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setChannelName("");
    setChannelDescription("");
  };

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case "channelName":
        setChannelName(value);
        break;
      case "channelDescription":
        setChannelDescription(value);
        break;
    }
  };

  return {
    channelName,
    channelDescription,
    isSubmitting,
    setIsSubmitting,
    handleFieldChange,
    resetForm,
  };
}
