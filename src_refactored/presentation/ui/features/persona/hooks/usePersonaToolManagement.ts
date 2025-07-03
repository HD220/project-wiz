import React from "react";
import { UseFormReturn } from "react-hook-form";

import { PersonaTemplateFormData } from "../components/PersonaTemplateForm";

export function usePersonaToolManagement(form: UseFormReturn<PersonaTemplateFormData>) {
  const [currentToolInput, setCurrentToolInput] = React.useState("");

  const handleAddTool = () => {
    const toolValue = currentToolInput.trim().toLowerCase();
    if (toolValue && !form.getValues("toolNames")?.includes(toolValue)) {
      const currentTools = form.getValues("toolNames") || [];
      form.setValue("toolNames", [...currentTools, toolValue], {
        shouldValidate: true,
        shouldDirty: true,
      });
      setCurrentToolInput("");
    }
  };

  const handleRemoveTool = (toolToRemove: string) => {
    const currentTools = form.getValues("toolNames") || [];
    form.setValue(
      "toolNames",
      currentTools.filter((tool) => tool !== toolToRemove),
      { shouldValidate: true, shouldDirty: true }
    );
  };

  return { currentToolInput, setCurrentToolInput, handleAddTool, handleRemoveTool };
}
